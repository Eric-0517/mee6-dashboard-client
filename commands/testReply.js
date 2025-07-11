const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('測試回覆')
    .setDescription('測試機器人回覆是否正常'),

  async execute(interaction) {
    try {
      await interaction.deferReply();
      await interaction.editReply('機器人正常回覆！');
    } catch (err) {
      console.error('測試回覆錯誤:', err);
    }
  }
};
