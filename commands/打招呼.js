const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('打招呼')
    .setDescription('跟機器人打招呼！'),
  async execute(interaction) {
    await interaction.reply('哈囉！我是三星蔥勞工機器人！');
  },
};
