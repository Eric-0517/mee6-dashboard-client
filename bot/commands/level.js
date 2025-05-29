
const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../../utils/xp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('查看你的等級'),
    async execute(interaction) {
        const user = await User.findOne({ 
            guildId: interaction.guild.id,
            userId: interaction.user.id 
        });

        if (!user) {
            return interaction.reply("你還沒有任何經驗值。快去聊天吧！");
        }

        interaction.reply(`你目前是等級 ${user.level}，XP: ${user.xp}`);
    }
};
