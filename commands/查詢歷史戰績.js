const { SlashCommandBuilder } = require('discord.js');
const { getPlayerProfileByName, getMatchListByUID } = require('../utils/aovApi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢戰績')
    .setDescription('透過玩家名稱查詢最新一場戰績')
    .addStringOption(option =>
      option.setName('名稱')
        .setDescription('請輸入傳說對決的玩家名稱')
        .setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString('名稱');

    await interaction.deferReply();

    const profile = await getPlayerProfileByName(name);
    if (!profile) {
      return interaction.editReply(`❌ 無法找到玩家：${name}`);
    }

    const { uid, server } = profile;
    const matches = await getMatchListByUID(uid, server, 1, 1);

    if (!matches.length) {
      return interaction.editReply(`⚠️ 找不到 ${name} 的戰績資料。`);
    }

    const match = matches[0];
    const heroImage = `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${match.heroId}head.jpg`;
    const result = match.result === 'WIN' ? '🏆 勝利' : '💀 敗北';

    await interaction.editReply({
      embeds: [{
        title: `${name} 的最新戰績`,
        thumbnail: { url: heroImage },
        fields: [
          { name: '英雄', value: match.heroName, inline: true },
          { name: 'K/D/A', value: `${match.kills}/${match.deaths}/${match.assists}`, inline: true },
          { name: '戰局結果', value: result, inline: true },
        ],
        footer: { text: `伺服器：${server} | UID：${uid}` },
        color: match.result === 'WIN' ? 0x00ff00 : 0xff0000,
        timestamp: new Date(match.matchTime),
      }],
    });
  },
};
