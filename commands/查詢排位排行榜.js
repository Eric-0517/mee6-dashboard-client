const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢排位排行榜')
    .setDescription('查詢伺服器前 100 名玩家（綜合排行榜）')
    .addIntegerOption(option =>
      option.setName('伺服器')
        .setDescription('選擇伺服器')
        .setRequired(true)
        .addChoices(
          { name: '聖騎之王', value: 1011 },
          { name: '純潔之翼', value: 1012 }
        )
    ),

  async execute(interaction) {
    const logicWorldId = interaction.options.getInteger('伺服器');
    await interaction.deferReply();

    try {
      const res = await axios.get('https://aovweb.azurewebsites.net/api/Rank/GetTopPlayerRankList', {
        params: { logicWorldId, rankType: 0, page: 1 }
      });

      const rankList = res.data.data.slice(0, 10) // 顯示前 10 名
        .map((player, index) => `${index + 1}. ${player.nickname} - ${player.rank}（${player.score} 分）`)
        .join('\n');

      await interaction.editReply({
        content: `🏆 排位排行榜（前 10 名）：\n${rankList}`
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ 查詢失敗，請稍後再試。');
    }
  }
};
