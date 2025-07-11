const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('獲取排位排行榜')
    .setDescription('查詢傳說對決排位排行榜（前 100 名）'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const url = 'https://aovweb.azurewebsites.net/Ranking/TOPRankPlayer';
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      const topPlayers = [];

      $('table tbody tr').each((i, el) => {
        if (i >= 100) return; // 只取前 100 名

        const rank = $(el).find('td').eq(0).text().trim();
        const playerName = $(el).find('td').eq(1).text().trim();
        const score = $(el).find('td').eq(2).text().trim();

        topPlayers.push({
          rank,
          playerName,
          score
        });
      });

      if (topPlayers.length === 0) {
        return await interaction.editReply('❌ 無法擷取排行榜資料。');
      }

      const embed = new EmbedBuilder()
        .setTitle('🏆 傳說對決 排位排行榜 TOP 100')
        .setColor('#FFD700')
        .setTimestamp();

      topPlayers.forEach(player => {
        embed.addFields({
          name: `#${player.rank} - ${player.playerName}`,
          value: `排位分：${player.score}`,
          inline: false
        });
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('❌ 擷取排行榜錯誤：', err);
      await interaction.editReply('❌ 查詢失敗，請稍後再試。');
    }
  }
};
