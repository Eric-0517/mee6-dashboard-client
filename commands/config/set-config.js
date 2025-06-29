const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../../config.json');

// 讀取目前設定
function loadConfig() {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath));
}

// 儲存設定
function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('設定')
    .setDescription('設定歡迎頻道、離開頻道、預設身分組')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('歡迎頻道')
        .setDescription('設定歡迎新成員的頻道')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('歡迎頻道')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('離開頻道')
        .setDescription('設定成員離開時送出訊息的頻道')
        .addChannelOption(option =>
          option.setName('channel')
            .setDescription('離開訊息頻道')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('預設身分組')
        .setDescription('設定新成員自動取得的身分組')
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('預設身分組')
            .setRequired(true)
        )
    ),

  async execute(interaction) {
    const config = loadConfig();
    const guildId = interaction.guild.id;

    if (!config[guildId]) config[guildId] = {};

    const sub = interaction.options.getSubcommand();
    if (sub === '歡迎頻道') {
      const channel = interaction.options.getChannel('channel');
      config[guildId].welcomeChannelId = channel.id;
      await interaction.reply(`✅ 已設定歡迎頻道為：${channel}`);
    } else if (sub === '離開頻道') {
      const channel = interaction.options.getChannel('channel');
      config[guildId].leaveChannelId = channel.id;
      await interaction.reply(`✅ 已設定離開頻道為：${channel}`);
    } else if (sub === '預設身分組') {
      const role = interaction.options.getRole('role');
      config[guildId].defaultRoleId = role.id;
      await interaction.reply(`✅ 已設定預設身分組為：${role}`);
    }

    saveConfig(config);
  },
};
