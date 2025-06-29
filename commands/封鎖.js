const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('封鎖')
    .setDescription('封鎖一位成員')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('要封鎖的成員')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(interaction) {
    const target = interaction.options.getUser('target');
    const member = await interaction.guild.members.fetch(target.id).catch(() => null);

    if (!member) {
      return interaction.reply({ content: '找不到這個成員。', ephemeral: true });
    }

    try {
      await member.ban({ reason: `封鎖者：${interaction.user.tag}` });
      await interaction.reply(`${target.tag} 已被封鎖。`);
    } catch (error) {
      await interaction.reply({ content: '封鎖失敗，可能是權限不足。', ephemeral: true });
    }
  },
};
