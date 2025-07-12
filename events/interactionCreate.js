const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require('discord.js');
const TestResult = require('../models/TestResult');
const { fetchMatchDetail } = require('../utils/aovStats');

// ✅ 心理測驗題目
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

// ✅ 建立心理測驗按鈕
const createButtons = (qIndex) => {
  const row = new ActionRowBuilder();
  questions[qIndex].options.forEach((opt, i) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`quiz_answer_${qIndex}_${i}`)
        .setLabel(opt)
        .setStyle(ButtonStyle.Primary)
    );
  });

  const controlRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('quiz_prev')
      .setLabel('⬅️ 上一步')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(qIndex === 0),
    new ButtonBuilder()
      .setCustomId('quiz_restart')
      .setLabel('🔄 重新開始')
      .setStyle(ButtonStyle.Danger)
  );

  return [row, controlRow];
};

// ✅ 心理測驗 Session
const sessions = new Map();
function createSession(userId) {
  if (sessions.has(userId)) clearTimeout(sessions.get(userId).timeout);
  const timeout = setTimeout(() => sessions.delete(userId), 10 * 60 * 1000);
  sessions.set(userId, { current: 0, answers: [], timeout });
}
function refreshSession(userId) {
  const s = sessions.get(userId);
  if (s) {
    clearTimeout(s.timeout);
    s.timeout = setTimeout(() => sessions.delete(userId), 10 * 60 * 1000);
  }
}

// ✅ 戰績 Embed 建構器（提供給查詢互動用）
function buildMatchEmbed(match, detail, index, total) {
  const { heroName, result, mode, kda, time, heroId } = match;

  const embed = {
    title: `🎮 第 ${index + 1} 場戰績｜${heroName || '未知英雄'}`,
    description: `**模式**：${mode}\n**結果**：${result}\n**KDA**：${kda}\n**時間**：${time}`,
    color: result.includes('勝') ? 0x00c853 : 0xd32f2f,
    thumbnail: { url: `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${heroId}head.jpg` },
    fields: [
      {
        name: '👥 我方成員',
        value: detail?.teammates?.join('\n') || '無資料',
        inline: true,
      },
      {
        name: '⚔️ 敵方成員',
        value: detail?.opponents?.join('\n') || '無資料',
        inline: true,
      },
    ],
  };

  const statsText = Object.entries(detail.stats || {})
    .map(([k, v]) => `• **${k}**：${v}`)
    .join('\n');
  if (statsText) embed.fields.push({ name: '📊 B50 測試欄位', value: statsText });

  if (detail.rank) {
    embed.footer = {
      text: `段位：${detail.rank}｜第 ${index + 1} / ${total} 場`,
    };
  }

  return embed;
}

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    try {
      const userId = interaction.user.id;

      // ✅ Slash 指令按鈕例外處理
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === '心理測驗') {
          createSession(userId);
          const q = questions[0].question;
          const components = createButtons(0);
          return interaction.reply({
            content: `🧠 心理測驗開始！\n\n${q}`,
            components,
            ephemeral: true,
          });
        }
      }

      // ✅ 處理心理測驗按鈕
      if (interaction.isButton()) {
        const customId = interaction.customId;
        const session = sessions.get(userId);

        if (customId === 'confirm_update') {
          return interaction.reply({
            content: '✅ 你已成功執行更新，歡迎體驗新功能！',
            ephemeral: true,
          });
        }

        if (!session && customId.startsWith('quiz_')) {
          return interaction.reply({
            content: '❌ 測驗會話已過期，請重新使用 `/心理測驗` 開始。',
            ephemeral: true,
          });
        }

        refreshSession(userId);

        if (customId.startsWith('quiz_answer_')) {
          const [_, qIndex, optIndex] = customId.split('_').map(Number);
          session.answers[qIndex] = questions[qIndex].options[optIndex];
          session.current = qIndex + 1;

          if (session.current >= questions.length) {
            await TestResult.create({
              userId,
              answers: session.answers,
              timestamp: new Date(),
            });

            sessions.delete(userId);
            return interaction.update({
              content: `✅ 測驗完成！你的答案如下：\n${session.answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}`,
              components: [],
            });
          }

          const q = questions[session.current].question;
          const components = createButtons(session.current);
          return interaction.update({ content: q, components });
        }

        if (customId === 'quiz_prev') {
          if (session.current > 0) {
            session.current--;
            const q = questions[session.current].question;
            const components = createButtons(session.current);
            return interaction.update({ content: q, components });
          }
          return interaction.deferUpdate();
        }

        if (customId === 'quiz_restart') {
          createSession(userId);
          const q = questions[0].question;
          const components = createButtons(0);
          return interaction.update({
            content: `🔄 已重新開始心理測驗\n\n${q}`,
            components,
          });
        }

        return interaction.reply({ content: '❓ 未知按鈕操作。', ephemeral: true });
      }

      // ✅ 處理戰績下拉選單
      if (interaction.isStringSelectMenu()) {
        const id = interaction.customId;

        const isByName = id.startsWith('name_match_');
        const key = isByName ? `name_${decodeURIComponent(id.replace('name_match_', ''))}` : id.replace('match_select_', '');

        const matchList = interaction.client.matchCache?.get(key);
        if (!matchList) {
          return interaction.reply({ content: '⚠️ 找不到快取資料，請重新查詢。', ephemeral: true });
        }

        const selectedId = interaction.values[0];
        const index = matchList.findIndex(m => m.id === selectedId);
        const match = matchList[index];
        const detail = await fetchMatchDetail(selectedId);
        const embed = buildMatchEmbed(match, detail, index, matchList.length);

        return interaction.update({ embeds: [embed] });
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
