const { SlashCommandBuilder } = require('discord.js');
const { getMatchListByUID } = require('../utils/aovApi');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢戰績_uid')
    .setDescription('透過 UID 與伺服器查詢最新一場戰績')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('請輸入玩家的 UID')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('伺服器')
        .setDescription('選擇伺服器')
        .addChoices(
          { name: '聖騎之王（1服）', value: 1011 },
          { name: '純潔之翼（2服）', value: 1012 }
        )
        .setRequired(true)
    ),
  async execute(interaction) {
    const uid = interaction.options.getString('uid');
    const server = interaction.options.getInteger('伺服器');

    await interaction.deferReply();

    const matches = await getMatchListByUID(uid, server, 1, 1);

    if (!matches.length) {
      return interaction.editReply(`⚠️ 找不到 UID：${uid} 的戰績資料。`);
    }

    const match = matches[0];
    const heroImage = `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${match.heroId}head.jpg`;
    const result = match.result === 'WIN' ? '🏆 勝利' : '💀 敗北';

    await interaction.editReply({
      embeds: [{
        title: `UID ${uid} 的最新戰績`,
        thumbnail: { url: heroImage },
        fields: [
          { name: '英雄', value: match.heroName, inline: true },
          { name: 'K/D/A', value: `${match.kills}/${match.deaths}/${match.assists}`, inline: true },
          { name: '戰局結果', value: result, inline: true },
        ],
        footer: { text: `伺服器：${server}` },
        color: match.result === 'WIN' ? 0x00ff00 : 0xff0000,
        timestamp: new Date(match.matchTime),
      }],
    });
  },
};
