const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('每日統計圖表')
    .setDescription('取得每日戰績統計圖表')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('玩家 UID')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('伺服器')
        .setDescription('伺服器代碼')
        .setRequired(true)
        .addChoices(
          { name: '聖騎之王', value: 1011 },
          { name: '純潔之翼', value: 1012 }
        )
    ),

  async execute(interaction) {
    const uid = interaction.options.getString('uid');
    const dwLogicWorldId = interaction.options.getInteger('伺服器');
    await interaction.deferReply();

    try {
      const res = await axios.get('https://aovweb.azurewebsites.net/api/Player/GetDailyData', {
        params: { uid, dwLogicWorldId }
      });

      const data = res.data.data.slice(-7); // 最近 7 天
      const labels = data.map(d => d.date);
      const winRates = data.map(d => d.winRate);

      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify({
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: '勝率',
            data: winRates,
            borderColor: 'blue',
            fill: false
          }]
        }
      }))}`;

      await interaction.editReply({
        content: '📈 每日勝率圖表如下：',
        files: [{ attachment: chartUrl, name: 'chart.png' }]
      });
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ 產生圖表失敗，請確認資料。');
    }
  }
};
