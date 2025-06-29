const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('抽卡')
    .setDescription('進行一次抽卡'),
  async execute(interaction) {
    const cards = ['⭐ 一星角色', '⭐⭐ 二星角色', '⭐⭐⭐ 三星角色', '🌟🌟🌟🌟 四星角色', '🌟🌟🌟🌟🌟 五星神角！'];
    const result = cards[Math.floor(Math.random() * cards.length)];
    await interaction.reply(`🎴 你抽到了：${result}`);
  }
};
