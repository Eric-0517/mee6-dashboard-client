const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const TestResult = require('../models/TestResult');

// 心理測驗題目
const questions = [
  {
    question: 'Q1：你喜歡哪種天氣？',
    options: ['☀️ 晴天', '🌧️ 雨天', '❄️ 雪天'],
  },
  {
    question: 'Q2：你偏好的飲料是？',
    options: ['🍵 茶', '☕ 咖啡', '🥤 可樂'],
  },
  {
    question: 'Q3：你喜歡哪種動物？',
    options: ['🐶 狗', '🐱 貓', '🐦 鳥'],
  },
];

// 動態建立按鈕
const createButtons = (questionIndex) => {
  const row = new ActionRowBuilder();
  questions[questionIndex].options.forEach((opt, idx) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`quiz_answer_${questionIndex}_${idx}`)
        .setLabel(opt)
        .setStyle(ButtonStyle.Primary)
    );
  });

  const controlRow = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('quiz_prev')
        .setLabel('⬅️ 上一步')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(questionIndex === 0),
      new ButtonBuilder()
        .setCustomId('quiz_restart')
        .setLabel('🔄 重新開始')
        .setStyle(ButtonStyle.Danger)
    );

  return [row, controlRow];
};

// 使用者答題 session 記錄
const sessions = new Map();

function createSession(userId) {
  if (sessions.has(userId)) clearTimeout(sessions.get(userId).timeout);

  const timeout = setTimeout(() => sessions.delete(userId), 10 * 60 * 1000);
  sessions.set(userId, {
    current: 0,
    answers: [],
    timeout,
  });
}

function refreshSession(userId) {
  const session = sessions.get(userId);
  if (session) {
    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => sessions.delete(userId), 10 * 60 * 1000);
  }
}

module.exports = {
  name: Events.InteractionCreate,
  /**
   * @param {import('discord.js').Interaction} interaction
   */
  async execute(interaction) {
    try {
      // ✅ Slash 指令處理區
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === '心理測驗') {
          const userId = interaction.user.id;
          createSession(userId);

          const q = questions[0].question;
          const components = createButtons(0);

          await interaction.reply({
            content: `🧠 心理測驗開始！\n\n${q}`,
            components,
            ephemeral: true,
          });
        }

        // 可加入更多指令區
      }

      // ✅ 按鈕互動處理
      else if (interaction.isButton()) {
        const userId = interaction.user.id;
        const customId = interaction.customId;

        // 👉 更新通知按鈕
        if (customId === 'confirm_update') {
          await interaction.reply({
            content: '✅ 你已成功執行更新，歡迎體驗新功能！',
            ephemeral: true,
          });
          return;
        }

        // 👉 心理測驗按鈕
        const session = sessions.get(userId);
        if (!session) {
          await interaction.reply({
            content: '❌ 測驗會話已過期，請重新輸入 `/心理測驗` 開始。',
            ephemeral: true,
          });
          return;
        }

        refreshSession(userId);

        // 處理答案選擇
        if (customId.startsWith('quiz_answer_')) {
          const [_, qIndex, optIndex] = customId.split('_').map(Number);
          session.answers[qIndex] = questions[qIndex].options[optIndex];
          session.current = qIndex + 1;

          if (session.current >= questions.length) {
            try {
              await TestResult.create({
                userId,
                answers: session.answers,
                timestamp: new Date(),
              });
            } catch (err) {
              console.error('❌ MongoDB 儲存失敗:', err);
            }

            await interaction.update({
              content: `✅ 測驗完成！你的答案如下：\n${session.answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}`,
              components: [],
            });
            clearTimeout(session.timeout);
            sessions.delete(userId);
            return;
          }

          const nextQ = questions[session.current].question;
          const components = createButtons(session.current);
          await interaction.update({
            content: `${nextQ}`,
            components,
          });
        }

        // 回到上一題
        else if (customId === 'quiz_prev') {
          if (session.current > 0) {
            session.current--;
            const prevQ = questions[session.current].question;
            const components = createButtons(session.current);
            await interaction.update({
              content: `${prevQ}`,
              components,
            });
          } else {
            await interaction.deferUpdate();
          }
        }

        // 重新開始
        else if (customId === 'quiz_restart') {
          createSession(userId);
          const q = questions[0].question;
          const components = createButtons(0);
          await interaction.update({
            content: `🔄 已重新開始心理測驗\n\n${q}`,
            components,
          });
        }

        // 其他未知按鈕
        else {
          await interaction.reply({ content: '未知按鈕操作。', ephemeral: true });
        }
      }

      // 可處理其他互動類型（例如 modal、select menu）
    } catch (err) {
      console.error('❌ interactionCreate 發生錯誤:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 發生錯誤，請稍後再試。',
          ephemeral: true,
        });
      }
    }
  },
};
