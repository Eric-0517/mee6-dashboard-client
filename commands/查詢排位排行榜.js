const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

const RANKING_URL = 'https://aovweb.azurewebsites.net/Ranking/TOPRankPlayer';

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢排位排行榜')
    .setDescription('查詢傳說對決官方前 100 名排位排行榜'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await axios.get(RANKING_URL, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept-Language': 'zh-TW'
        }
      });

      const $ = cheerio.load(response.data);
      const rows = $('table tbody tr');

      if (!rows.length) {
        return interaction.editReply('❌ 查無排行榜資料');
      }

      const topPlayers = [];

      rows.each((i, row) => {
        const columns = $(row).find('td');
        const rank = $(columns[0]).text().trim();
        const name = $(columns[1]).text().trim();
        const score = $(columns[2]).text().trim();
        const wins = $(columns[3]).text().trim();
        const mvp = $(columns[4]).text().trim();

        topPlayers.push({ rank, name, score, wins, mvp });
      });

      // 取前 10 名作為 Embed 展示
      const top10 = topPlayers.slice(0, 10).map(p =>
        `🏅 **#${p.rank}**｜${p.name}｜排位分：${p.score}｜勝場：${p.wins}｜MVP：${p.mvp}`
      ).join('\n');

      const embed = new EmbedBuilder()
        .setTitle('📊 傳說對決 排位排行榜 TOP 10')
        .setDescription(top10)
        .setColor('#FFD700')
        .setFooter({ text: '資料來源：aovweb.azurewebsites.net' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error('❌ 查詢排行榜失敗:', error.message);
      await interaction.editReply('❌ 查詢排行榜時發生錯誤，請稍後再試。');
    }
  }
};
