const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('設定離開頻道')
    .setDescription('設定成員離開時的通知頻道')
    .addChannelOption(option =>
      option.setName('頻道')
        .setDescription('選擇離開頻道')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const channel = interaction.options.getChannel('頻道');
    updateEnvFile('LEAVE_CHANNEL_ID', channel.id);
    await interaction.reply(`✅ 已設定離開頻道為：${channel.name}`);
  },
};

function updateEnvFile(key, value) {
  let env = fs.readFileSync(envPath, 'utf8');
  const regex = new RegExp(`${key}=.*`);
  if (env.match(regex)) {
    env = env.replace(regex, `${key}=${value}`);
  } else {
    env += `\n${key}=${value}`;
  }
  fs.writeFileSync(envPath, env);
}
