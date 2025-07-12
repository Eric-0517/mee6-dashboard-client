const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { fetchRankList } = require('../utils/aovStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢排行榜')
    .setDescription('查詢伺服器排行榜前十名')
    .addIntegerOption(opt =>
      opt.setName('server')
        .setDescription('伺服器 ID：1011=聖騎之王、1012=純潔之翼')
        .setRequired(true)
    ),

  async execute(interaction) {
    const serverId = interaction.options.getInteger('server');
    await interaction.deferReply();

    const rankList = await fetchRankList(serverId);

    if (!rankList.length) {
      return interaction.editReply('❌ 查詢排行榜失敗，請確認伺服器 ID 是否正確。');
    }

    const embed = new EmbedBuilder()
      .setTitle(`🏆 伺服器 ${serverId} 排行榜前 10 名`)
      .setColor(0xfacc15)
      .setFooter({ text: '資料來源：Garena 傳說對決官網' });

    rankList.slice(0, 10).forEach((p, i) => {
      embed.addFields({
        name: `#${i + 1} - ${p.name}`,
        value: `等級：${p.rank}｜積分：${p.score}`,
      });
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
