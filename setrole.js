const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('../models/guildConfig');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setrole')
    .setDescription('設定新成員加入時自動賦予的身分組')
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('要自動分配的身分組')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // 僅限管理員使用

  async execute(interaction) {
    // 確保是管理員，若 Discord 上設計權限無效就手動檢查
    if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: '❌ 你沒有權限執行這個指令。', ephemeral: true });
    }

    const role = interaction.options.getRole('role');

    try {
      await GuildConfig.findOneAndUpdate(
        { guildId: interaction.guild.id },
        { autoRoleId: role.id },
        { upsert: true, new: true }
      );

      await interaction.reply(`✅ 已設定新成員自動分配身分組為：**${role.name}**`);
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ 儲存設定時發生錯誤。', ephemeral: true });
    }
  },
};
