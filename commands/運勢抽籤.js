const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('抽籤運勢')
    .setDescription('抽一支運勢籤'),
  async execute(interaction) {
    const fortunes = ['大吉 🍀', '中吉 ✨', '小吉 🌟', '吉 😊', '兇 😨', '大兇 💀'];
    const result = fortunes[Math.floor(Math.random() * fortunes.length)];
    await interaction.reply(`🔮 你今天的運勢是：${result}`);
  }
};
