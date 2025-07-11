const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const TestResult = require('../models/TestResult');
const { fetchMatchDetail } = require('../utils/aovStats');

const matchCache = new Map(); // 用於歷史戰績選單切換
const sessions = new Map();   // 心理測驗會話

// 心理測驗題庫
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

// 建立心理測驗按鈕
function createButtons(index) {
  const row = new ActionRowBuilder();
  questions[index].options.forEach((opt, i) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`quiz_answer_${index}_${i}`)
        .setLabel(opt)
        .setStyle(ButtonStyle.Primary)
    );
  });

  const controlRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('quiz_prev')
      .setLabel('⬅️ 上一步')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(index === 0),
    new ButtonBuilder()
      .setCustomId('quiz_restart')
      .setLabel('🔄 重新開始')
      .setStyle(ButtonStyle.Danger)
  );

  return [row, controlRow];
}

// 建立嵌入戰績內容
function createMatchEmbed(detail, summary, index, total) {
  const heroIcon = detail.heroId
    ? `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${detail.heroId}head.jpg`
    : null;

  const embed = {
    title: `第 ${index} 場戰績 - ${summary.heroName || '未知英雄'}`,
    description: `🏆 結果：**${summary.result}**\n🎮 模式：${summary.mode}\n🕒 時間：${summary.time}\n📊 KDA：${summary.kda}`,
    fields: [
      {
        name: '🔵 我方隊友',
        value: detail.teammates.join('\n') || '無資料',
        inline: true,
      },
      {
        name: '🔴 敵方隊伍',
        value: detail.opponents.join('\n') || '無資料',
        inline: true,
      },
      {
        name: '📈 B50 測試欄位',
        value:
          Object.entries(detail.stats)
            .map(([k, v]) => `${k}：${v}`)
            .join('\n') || '無',
      },
    ],
    footer: {
      text: `第 ${index} / ${total} 場戰績`,
    },
    color: 0x4ba3f1,
  };

  if (heroIcon) embed.thumbnail = { url: heroIcon };
  return embed;
}

// 🔁 建立心理測驗會話
function createSession(userId) {
  if (sessions.has(userId)) clearTimeout(sessions.get(userId).timeout);
  const timeout = setTimeout(() => sessions.delete(userId), 10 * 60 * 1000);
  sessions.set(userId, {
    current: 0,
    answers: [],
    timeout,
  });
}

// 🔁 重新整理 timeout
function refreshSession(userId) {
  const session = sessions.get(userId);
  if (session) {
    clearTimeout(session.timeout);
    session.timeout = setTimeout(() => sessions.delete(userId), 10 * 60 * 1000);
  }
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      // ✅ Slash 指令
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === '心理測驗') {
          const userId = interaction.user.id;
          createSession(userId);

          const q = questions[0].question;
          const components = createButtons(0);

          return interaction.reply({
            content: `🧠 心理測驗開始！\n\n${q}`,
            components,
            ephemeral: true,
          });
        }

        // 👉 其他指令在各自指令檔案內處理（查詢戰績...等）
      }

      // ✅ 按鈕互動（心理測驗）
      else if (interaction.isButton()) {
        const userId = interaction.user.id;
        const customId = interaction.customId;

        if (customId === 'confirm_update') {
          return interaction.reply({
            content: '✅ 更新成功，歡迎體驗新功能！',
            ephemeral: true,
          });
        }

        const session = sessions.get(userId);
        if (!session) {
          return interaction.reply({
            content: '❌ 測驗會話已過期，請重新輸入 `/心理測驗`。',
            ephemeral: true,
          });
        }

        refreshSession(userId);

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
            } catch (e) {
              console.error('❌ MongoDB 儲存失敗:', e);
            }

            sessions.delete(userId);
            return interaction.update({
              content: `✅ 測驗完成！你的答案如下：\n${session.answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}`,
              components: [],
            });
          }

          const nextQ = questions[session.current].question;
          const components = createButtons(session.current);
          return interaction.update({ content: nextQ, components });
        }

        // 👉 上一步
        if (customId === 'quiz_prev') {
          if (session.current > 0) {
            session.current--;
            const prevQ = questions[session.current].question;
            const components = createButtons(session.current);
            return interaction.update({ content: prevQ, components });
          } else {
            return interaction.deferUpdate();
          }
        }

        // 👉 重新開始
        if (customId === 'quiz_restart') {
          createSession(userId);
          const q = questions[0].question;
          const components = createButtons(0);
          return interaction.update({ content: `🔄 已重新開始心理測驗\n\n${q}`, components });
        }

        // 👉 未知按鈕
        return interaction.reply({ content: '❌ 未知按鈕操作。', ephemeral: true });
      }

      // ✅ 選單互動（戰績場次切換）
      else if (interaction.isStringSelectMenu()) {
        const { customId, values, user } = interaction;
        if (customId === 'select_match') {
          const index = parseInt(values[0]);
          const cache = matchCache.get(user.id);
          if (!cache || !cache.matchList[index]) {
            return interaction.reply({ content: '❌ 資料已過期，請重新查詢。', ephemeral: true });
          }

          const summary = cache.matchList[index];
          const detail = await fetchMatchDetail(summary.id);
          const embed = createMatchEmbed(detail, summary, index + 1, cache.matchList.length);

          return interaction.update({
            content: `🎮 已切換至第 ${index + 1} 場戰績：`,
            embeds: [embed],
          });
        }
      }
    } catch (err) {
      console.error('❌ interactionCreate 發生錯誤:', err);

      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: '❌ 發生錯誤，請稍後再試。',
          ephemeral: true,
        });
      } else {
        await interaction.followUp({
          content: '⚠️ 發生錯誤，請稍後再試。',
          ephemeral: true,
        });
      }
    }
  },
};
