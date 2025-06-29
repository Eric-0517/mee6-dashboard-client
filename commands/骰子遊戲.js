const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('骰子遊戲')
    .setDescription('擲一顆 6 面骰子'),
  async execute(interaction) {
    const dice = Math.floor(Math.random() * 6) + 1;
    await interaction.reply(`🎲 你擲出了：${dice}`);
  }
};
