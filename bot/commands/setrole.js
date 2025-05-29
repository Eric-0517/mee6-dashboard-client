
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { RoleReward } = require('../../utils/xp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setrole')
        .setDescription('設定等級對應的角色')
        .addIntegerOption(opt => opt.setName('level').setDescription('等級').setRequired(true))
        .addRoleOption(opt => opt.setName('role').setDescription('授予的角色').setRequired(true)),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "你沒有權限設定角色。", ephemeral: true });
        }

        const level = interaction.options.getInteger('level');
        const role = interaction.options.getRole('role');

        await RoleReward.findOneAndUpdate(
            { guildId: interaction.guild.id, level },
            { roleId: role.id },
            { upsert: true }
        );

        interaction.reply(`✅ 當等級達到 ${level} 時，將自動獲得角色 ${role.name}`);
    }
};
