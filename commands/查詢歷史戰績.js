const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
} = require('discord.js');
const {
  fetchMatchHistoryListByName,
  fetchMatchDetail,
} = require('../utils/aovStats');

const matchCache = new Map(); // 儲存場次快取給互動選單用

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績')
    .setDescription('輸入玩家名稱查詢傳說對決歷史戰績')
    .addStringOption(option =>
      option
        .setName('玩家名稱')
        .setDescription('請輸入玩家的遊戲名稱')
        .setRequired(true)
    ),

  async execute(interaction) {
    const playerName = interaction.options.getString('玩家名稱');
    await interaction.deferReply(); // 延遲回應，避免逾時

    try {
      const matchList = await fetchMatchHistoryListByName(playerName);
      if (!matchList || matchList.length === 0) {
        return await interaction.editReply(`❌ 找不到玩家 **${playerName}** 的對戰資料。`);
      }

      matchCache.set(interaction.user.id, { matchList });

      const first = await fetchMatchDetail(matchList[0].id);
      const embed = createMatchEmbed(first, matchList[0], 1, matchList.length);

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_match')
        .setPlaceholder('請選擇要查看的場次')
        .addOptions(
          matchList.map((m, i) => ({
            label: `第 ${i + 1} 場 - ${m.heroName || '未知英雄'}`,
            description: `${m.result} | ${m.kda} | ${m.mode}`,
            value: `${i}`,
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.editReply({
        content: `🎮 玩家 **${playerName}** 的最近對戰紀錄：`,
        embeds: [embed],
        components: [row],
      });
    } catch (err) {
      console.error('❌ 查詢歷史戰績錯誤:', err);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ 發生錯誤，請稍後再試。', ephemeral: true });
      } else {
        await interaction.followUp({ content: '❌ 發生錯誤，請稍後再試。', ephemeral: true });
      }
    }
  },
};

// 🔧 建立嵌入訊息格式
function createMatchEmbed(detail, summary, index, total) {
  const heroIcon = detail.heroId
    ? `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${detail.heroId}head.jpg`
    : null;

  const embed = new EmbedBuilder()
    .setTitle(`第 ${index} 場戰績 - ${summary.heroName || '未知英雄'}`)
    .setDescription(`🏆 結果：**${summary.result}**\n🎮 模式：${summary.mode}\n🕒 時間：${summary.time}\n📊 KDA：${summary.kda}`)
    .addFields(
      {
        name: '🔵 我方隊友',
        value: detail.teammates.join('\n') || '無資料',
        inline: true,
      },
      {
        name: '🔴 敵方隊伍',
        value: detail.opponents.join('\n') || '無資料',
        inline: true,
      },
      {
        name: '📈 B50 測試欄位',
        value:
          Object.entries(detail.stats)
            .map(([k, v]) => `${k}：${v}`)
            .join('\n') || '無',
      }
    )
    .setFooter({ text: `第 ${index} / ${total} 場戰績` })
    .setColor(0x4ba3f1);

  if (heroIcon) embed.setThumbnail(heroIcon);
  return embed;
}
