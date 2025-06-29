const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('擲硬幣')
    .setDescription('擲一枚硬幣'),
  async execute(interaction) {
    const result = Math.random() < 0.5 ? '正面 🪙' : '反面 🪙';
    await interaction.reply(`你擲出了：${result}`);
  }
};
