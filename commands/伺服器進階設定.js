const { SlashCommandBuilder } = require("discord.js");
const GuildConfig = require("../models/GuildConfig");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("伺服器進階設定")
    .setDescription("設定伺服器的歡迎頻道、離開頻道與預設角色")
    .addChannelOption(option =>
      option.setName("welcome_channel").setDescription("加入歡迎頻道").setRequired(true))
    .addChannelOption(option =>
      option.setName("leave_channel").setDescription("離開訊息頻道").setRequired(true))
    .addRoleOption(option =>
      option.setName("default_role").setDescription("新成員預設身分組").setRequired(true)),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const welcomeChannelId = interaction.options.getChannel("welcome_channel").id;
    const leaveChannelId = interaction.options.getChannel("leave_channel").id;
    const defaultRoleId = interaction.options.getRole("default_role").id;

    await GuildConfig.findOneAndUpdate(
      { guildId },
      { welcomeChannelId, leaveChannelId, defaultRoleId },
      { upsert: true }
    );

    await interaction.reply("✅ 已成功儲存伺服器設定！");
  }
};
