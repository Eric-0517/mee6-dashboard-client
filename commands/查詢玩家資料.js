const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢玩家資料')
    .setDescription('🔍 透過玩家名稱查詢傳說對決玩家資料')
    .addStringOption(option =>
      option.setName('名稱')
        .setDescription('請輸入玩家名稱')
        .setRequired(true)
    ),

  async execute(interaction) {
    const name = interaction.options.getString('名稱');
    const encodedName = encodeURIComponent(name);
    const url = `https://aovweb.azurewebsites.net/Player/View?searchType=playerName&keyword=${encodedName}`;

    await interaction.deferReply();

    try {
      const res = await axios.get(url);
      const $ = cheerio.load(res.data);

      // 嘗試擷取關鍵欄位
      const info = {};
      $('table tr').each((_, el) => {
        const key = $(el).find('th').text().trim();
        const value = $(el).find('td').text().trim();
        if (key && value) info[key] = value;
      });

      // 玩家名稱可能在 h3 裡面
      const playerName = $('h3').first().text().trim() || name;

      const embed = new EmbedBuilder()
        .setTitle('🎮 玩家資訊')
        .setURL(url)
        .setColor(0x00BFFF)
        .addFields(
          { name: '玩家名稱', value: playerName, inline: true },
          { name: 'UID', value: info['UID'] || '未知', inline: true },
          { name: '伺服器', value: info['伺服器'] || '未知', inline: true },
          { name: '是否上線', value: info['是否上線'] || '未知', inline: true },
          { name: '上次上線時間', value: info['上次上線時間'] || '未知', inline: false },
          { name: '等級 | 經驗值', value: info['等級|經驗值'] || '未知', inline: true },
          { name: 'VIP 等級 | 分數', value: info['VIP等級|分數'] || '未知', inline: true },
          { name: '社會信用分數', value: info['社會信用分數'] || '未知', inline: true },
          { name: '行為分數(初始值100)', value: info['行為分數(初始值100)'] || '未知', inline: true },
          { name: '行為分數()', value: info['行為分數()'] || '未知', inline: true },
          { name: '總被按讚次數', value: info['總被按讚次數'] || '未知', inline: true },
          { name: '被讚數', value: info['被讚數'] || '未知', inline: true },
          { name: '被舉報數', value: info['被舉報數'] || '未知', inline: true },
          { name: '主頁熱度', value: info['主頁熱度'] || '未知', inline: true },
          { name: '公會名稱', value: info['公會名稱'] || '未知', inline: true },
          { name: '英雄數量', value: info['英雄數量'] || '未知', inline: true },
          { name: '造型數量', value: info['造型數量'] || '未知', inline: true },
          { name: '個性簽名內容', value: info['個性簽名內容'] || '無', inline: false },
          { name: '個性簽名更新時間', value: info['個性簽名更新時間'] || '未知', inline: true },
          { name: '登入版本', value: info['登入版本'] || '未知', inline: true },
          { name: '最常被逮捕的項目', value: info['最常被逮捕的項目'] || '未知', inline: true },
          { name: '[test]GameID', value: info['[test]GameID'] || '未知', inline: true },
          { name: '[test]AcntID', value: info['[test]AcntID'] || '未知', inline: true },
        )
        .setFooter({ text: '該功能目前處於開發階段，資料可能有誤' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error('❌ 查詢玩家資料失敗：', err);
      await interaction.editReply('❌ 查詢失敗，請稍後再試。');
    }
  }
};
