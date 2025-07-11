const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  PermissionsBitField,
} = require('discord.js');

const TestResult = require('../models/TestResult');
const matchCommand = require('../commands/查詢歷史戰績');
const { fetchMatchDetail } = require('../utils/aovStats');

// ==================== 🧠 心理測驗題目與邏輯 ==================== //
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

const quizSessions = new Map();

function createSession(userId) {
  if (quizSessions.has(userId)) clearTimeout(quizSessions.get(userId).timeout);
  const timeout = setTimeout(() => quizSessions.delete(userId), 10 * 60 * 1000);
  quizSessions.set(userId, {
    current: 0,
    answers: [],
    timeout,
  });
}

function refreshSession(userId) {
  const session = quizSessions.get(userId);
  if (session) {
    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => quizSessions.delete(userId), 10 * 60 * 1000);
  }
}

// ==================== 🎯 主互動監聽器 ==================== //

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      const userId = interaction.user.id;
      const customId = interaction.customId;

      // ✅ Slash 指令處理區
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === '心理測驗') {
          createSession(userId);
          const q = questions[0].question;
          const components = createButtons(0);

          await interaction.reply({
            content: `🧠 心理測驗開始！\n\n${q}`,
            components,
            ephemeral: true,
          });
        }
        return;
      }

      // ✅ 選單互動：查詢歷史戰績
      if (interaction.isStringSelectMenu() && customId === 'match_select') {
        const cache = matchCommand.cache.get(userId);
        if (!cache) {
          return interaction.reply({ content: '⚠️ 請先使用 /查詢歷史戰績 查詢資料。', ephemeral: true });
        }

        const index = parseInt(interaction.values[0]);
        const matchInfo = cache.matchList[index];

        await interaction.deferUpdate();
        const detail = await fetchMatchDetail(matchInfo.id);
        const embed = matchCommand.createMatchEmbed(detail, index + 1, cache.matchList.length);
        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // ✅ 按鈕互動處理區（心理測驗與其他按鈕）
      if (interaction.isButton()) {
        // 👉 更新通知按鈕
        if (customId === 'confirm_update') {
          await interaction.reply({
            content: '✅ 你已成功執行更新，歡迎體驗新功能！',
            ephemeral: true,
          });
          return;
        }

        // 👉 心理測驗按鈕
        const session = quizSessions.get(userId);
        if (customId.startsWith('quiz_')) {
          if (!session) {
            await interaction.reply({
              content: '❌ 測驗會話已過期，請重新輸入 `/心理測驗` 開始。',
              ephemeral: true,
            });
            return;
          }

          refreshSession(userId);

          // 回答選項
          if (customId.startsWith('quiz_answer_')) {
            const [_, qIndex, optIndex] = customId.split('_').map(Number);
            session.answers[qIndex] = questions[qIndex].options[optIndex];
            session.current = qIndex + 1;

            // ➤ 結束測驗
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
              quizSessions.delete(userId);
              return;
            }

            const nextQ = questions[session.current].question;
            const components = createButtons(session.current);
            await interaction.update({
              content: `${nextQ}`,
              components,
            });
            return;
          }

          // 上一步
          if (customId === 'quiz_prev') {
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
            return;
          }

          // 重新開始
          if (customId === 'quiz_restart') {
            createSession(userId);
            const q = questions[0].question;
            const components = createButtons(0);
            await interaction.update({
              content: `🔄 已重新開始心理測驗\n\n${q}`,
              components,
            });
            return;
          }

          // 其他 quiz_ 未知操作
          return interaction.reply({ content: '未知心理測驗操作。', ephemeral: true });
        }

        // 其他未知按鈕
        return interaction.reply({ content: '未知按鈕操作。', ephemeral: true });
      }
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
