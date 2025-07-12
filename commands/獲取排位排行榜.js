const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('獲取排位排行榜')
    .setDescription('查詢傳說對決排位排行榜（前 50 名）')
    .addStringOption(option =>
      option.setName('server')
        .setDescription('選擇伺服器')
        .setRequired(true)
        .addChoices(
          { name: '聖騎之王（1服）', value: '1' },
          { name: '純潔之翼（2服）', value: '2' }
        )
    ),

  async execute(interaction) {
    const server = interaction.options.getString('server');
    const serverName = server === '1' ? '聖騎之王' : '純潔之翼';
    const page = 1;

    await interaction.deferReply();

    try {
      const url = `https://aovweb.azurewebsites.net/Ranking/TOPRankPlayerList?page=${page}&server=${server}`;
      const res = await axios.get(url);
      const playerList = res.data?.data?.list;

      if (!playerList || playerList.length === 0) {
        return await interaction.editReply(`❌ 查無 ${serverName} 的排行榜資料。`);
      }

      const embed = new EmbedBuilder()
        .setTitle(`🏆 ${serverName} 排位排行榜 - 第 ${page} 頁`)
        .setColor(0xFFD700)
        .setTimestamp();

      // 限制最多 25 名（Embed 最多可顯示 25 欄位）
      const topPlayers = playerList.slice(0, 25);

      topPlayers.forEach((player, index) => {
        embed.addFields({
          name: `#${player.rank} - ${player.name}`,
          value: `🎯 排位分：${player.score}｜${player.rank || '未知'}｜擅長英雄：${player.mainHero || '無'}`,
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
