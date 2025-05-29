
const { SlashCommandBuilder } = require('discord.js');
const { User } = require('../../utils/xp');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('查看伺服器排行榜'),
    async execute(interaction) {
        const topUsers = await User.find({ guildId: interaction.guild.id })
            .sort({ level: -1, xp: -1 })
            .limit(10);

        if (!topUsers.length) {
            return interaction.reply("目前還沒有任何排行榜資料。");
        }

        const leaderboard = topUsers.map((user, index) => 
            `#${index + 1} <@${user.userId}> - 等級 ${user.level}, XP ${user.xp}`
        ).join('\n');

        interaction.reply(`🏆 **排行榜前十名：**\n${leaderboard}`);
    }
};
