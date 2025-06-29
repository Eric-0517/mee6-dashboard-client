// commands/查詢帳號登入ip.js
const { SlashCommandBuilder } = require('discord.js');
const { fetchLoginIP } = require('../utils/aovStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢帳號登入ip')
    .setDescription('查詢指定帳號的登入 IP')
    .addStringOption(option =>
      option.setName('帳號')
        .setDescription('輸入帳號名稱')
        .setRequired(true)
    ),
  async execute(interaction) {
    const account = interaction.options.getString('帳號');
    const data = await fetchLoginIP(account);

    await interaction.reply(`🛡️ 帳號 **${data.account}** 的最近登入 IP 為：\`${data.ip}\``);
  }
};
