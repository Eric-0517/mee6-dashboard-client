const { SlashCommandBuilder } = require('discord.js');
const GuildConfig = require('../models/GuildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('welcome-message')
    .setDescription('設定歡迎訊息')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('輸入歡迎訊息內容')
        .setRequired(true)),
  async execute(interaction) {
    const guildId = interaction.guild.id;
    const message = interaction.options.getString('message');

    let config = await GuildConfig.findOne({ guildId });
    if (!config) {
      config = new GuildConfig({ guildId });
    }

    config.welcomeMessage = message;
    await config.save();

    await interaction.reply('✅ 歡迎訊息已設定完成！');
  }
};
