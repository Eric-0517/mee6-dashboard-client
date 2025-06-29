const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const TestResult = require('../models/TestResult');

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

  // 控制按鈕
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

const sessions = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('心理測驗')
    .setDescription('進行一個簡單的心理測驗'),

  async execute(interaction) {
    const userId = interaction.user.id;

    sessions.set(userId, {
      current: 0,
      answers: [],
    });

    const q = questions[0].question;
    const components = createButtons(0);

    await interaction.reply({
      content: `🧠 心理測驗開始！\n\n${q}`,
      components,
      ephemeral: true, // 讓使用者獨立看見
    });
  },

  async handleInteraction(interaction) {
    const userId = interaction.user.id;
    const session = sessions.get(userId);
    if (!session) return;

    const customId = interaction.customId;

    // 處理選擇答案
    if (customId.startsWith('quiz_answer_')) {
      const [_, qIndex, optIndex] = customId.split('_').map(Number);
      session.answers[qIndex] = questions[qIndex].options[optIndex];
      session.current = qIndex + 1;

      // 如果回答完所有題目
      if (session.current >= questions.length) {
        await TestResult.create({
          userId,
          answers: session.answers,
          timestamp: new Date(),
        });

        await interaction.update({
          content: `✅ 測驗完成！你的答案如下：\n${session.answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}`,
          components: [],
        });
        sessions.delete(userId);
        return;
      }

      // 下一題
      const nextQ = questions[session.current].question;
      const components = createButtons(session.current);
      await interaction.update({
        content: `${nextQ}`,
        components,
      });
    }

    // 上一步
    else if (customId === 'quiz_prev') {
      if (session.current > 0) {
        session.current--;
        const prevQ = questions[session.current].question;
        const components = createButtons(session.current);
        await interaction.update({
          content: `${prevQ}`,
          components,
        });
      }
    }

    // 重新開始
    else if (customId === 'quiz_restart') {
      sessions.set(userId, { current: 0, answers: [] });
      const q = questions[0].question;
      const components = createButtons(0);
      await interaction.update({
        content: `🔄 重新開始心理測驗！\n\n${q}`,
        components,
      });
    }
  },
};
