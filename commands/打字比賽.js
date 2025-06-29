const { SlashCommandBuilder } = require('discord.js');

const sentencePool = [
  '快速的棕色狐狸跳過了懶狗。',
  '學而時習之，不亦說乎？',
  '今天天氣真好，適合出門散步。',
  'Discord 是一個很棒的聊天平台。',
  '人工智慧正在改變世界。'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('打字比賽')
    .setDescription('看看誰打得最快！'),
  async execute(interaction) {
    const sentence = sentencePool[Math.floor(Math.random() * sentencePool.length)];
    await interaction.reply(`💬 請在 30 秒內複製這句話並發送：\n\n\`${sentence}\``);
  },
};
