const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const { fetchMatchHistoryList, fetchMatchDetail } = require('../utils/aovStats');

const matchCache = new Map(); // 使用記憶體暫存查詢資料

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績')
    .setDescription('查詢傳說對決的歷史戰績（透過玩家名稱）')
    .addStringOption(option =>
      option.setName('玩家名稱')
        .setDescription('輸入傳說對決玩家名稱')
        .setRequired(true)
    ),

  async execute(interaction) {
    const playerName = interaction.options.getString('玩家名稱');
    await interaction.deferReply();

    try {
      const matchList = await fetchMatchHistoryList(playerName);
      if (!matchList || matchList.length === 0) {
        return interaction.editReply(`❌ 找不到玩家 ${playerName} 的戰績資料。`);
      }

      // 暫存資料：以 user.id 為 key，儲存查詢對應的所有 matchList
      matchCache.set(interaction.user.id, { matchList, playerName });

      const matchDetail = await fetchMatchDetail(matchList[0].id);
      const embed = createMatchEmbed(matchDetail, 1, matchList.length);

      const menu = new StringSelectMenuBuilder()
        .setCustomId('match_select')
        .setPlaceholder('選擇要查看的場次')
        .addOptions(
          matchList.map((match, index) => ({
            label: `第 ${index + 1} 場 - ${match.heroName}`,
            description: `${match.result} | ${match.kills}/${match.deaths}/${match.assists}`,
            value: String(index),
          }))
        );

      const row = new ActionRowBuilder().addComponents(menu);

      await interaction.editReply({ embeds: [embed], components: [row] });
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ 查詢時發生錯誤，請稍後再試。');
    }
  },

  // 提供外部存取快取（給 interactionCreate 用）
  cache: matchCache,
};

// 建立顯示 embed 的函式
function createMatchEmbed(data, index, total) {
  const {
    heroName,
    heroId,
    result,
    mode,
    duration,
    kills,
    deaths,
    assists,
    MVP,
    damage,
    tank,
    logicWorldId,
    time,
    rankScore,
    extraRankScore,
    lane,
    credit,
  } = data;

  const embed = new EmbedBuilder()
    .setColor(result === '勝利' ? 0x00d26a : 0xff4e4e)
    .setTitle(`${result} | ${heroName} | ${kills}/${deaths}/${assists}`)
    .setThumbnail(`https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${heroId}head.jpg`)
    .addFields(
      { name: '模式', value: mode, inline: true },
      { name: '時間', value: time, inline: true },
      { name: '對戰時長', value: duration, inline: true },
      { name: 'MVP', value: MVP, inline: true },
      { name: '輸出傷害', value: damage, inline: true },
      { name: '承受傷害', value: tank, inline: true },
      { name: '分路 (系統)', value: lane || '未知', inline: true },
      { name: '排位分', value: `${rankScore} (+${extraRankScore})`, inline: true },
      { name: '信譽分', value: String(credit), inline: true },
    )
    .setFooter({ text: `第 ${index} 場 / 共 ${total} 場` });

  return embed;
}
