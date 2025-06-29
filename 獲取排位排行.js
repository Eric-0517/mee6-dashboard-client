// commands/獲取排位排行.js
const { SlashCommandBuilder } = require('discord.js');
const { fetchRankLeaderboard } = require('../utils/aovStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('獲取排位排行')
    .setDescription('顯示前 10 名玩家的排位排行榜'),
  async execute(interaction) {
    const leaderboard = await fetchRankLeaderboard();

    const content = leaderboard.map(player =>
      `#${player.rank} - **${player.name}**：${player.score} 分`
    ).join('\n');

    await interaction.reply(`🏆 **排位排行榜前 10 名：**\n${content}`);
  }
};
