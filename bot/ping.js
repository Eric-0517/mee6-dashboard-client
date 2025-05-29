const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('回覆 Pong！'),
  async execute(interaction) {
    await interaction.reply('Pong！');
  },
};
