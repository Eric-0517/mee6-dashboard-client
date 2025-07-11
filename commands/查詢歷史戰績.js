const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  EmbedBuilder,
} = require('discord.js');
const { fetchMatchHistoryList, fetchMatchDetail } = require('../utils/aovStats');

function createMatchEmbed(player, index, total, match) {
  const teammates = Array.isArray(match.teammates) ? match.teammates.join('\n') : '無隊友資料';
  const opponents = Array.isArray(match.opponents) ? match.opponents.join('\n') : '無敵隊資料';
  const stats = match.stats && typeof match.stats === 'object'
    ? Object.entries(match.stats).map(([k, v]) => `**${k}**：${v}`).join('\n')
    : '無詳細數據';

  const heroHeadUrl = match.heroId
    ? `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${match.heroId}head.jpg`
    : null;

  const embed = new EmbedBuilder()
    .setTitle(`🎮 ${player} 的歷史戰績`)
    .setDescription(`第 ${index}/${total} 場 - 對局 ID：\`${match.id || '無'}\``)
    .addFields(
      { name: '🏅 評分（名次）', value: match.rank || '無', inline: true },
      { name: '🟦 我方隊伍', value: teammates, inline: false },
      { name: '🟥 敵方隊伍', value: opponents, inline: false },
      { name: '📊 詳細統計', value: stats, inline: false }
    )
    .setColor('#00ADEF')
    .setTimestamp();

  if (heroHeadUrl) embed.setThumbnail(heroHeadUrl);
  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績')
    .setDescription('查詢玩家歷史戰績（支援切換場次）')
    .addStringOption(opt =>
      opt.setName('玩家').setDescription('玩家名稱').setRequired(true)
    ),

  async execute(interaction) {
    const player = interaction.options.getString('玩家');
    await interaction.deferReply();

    try {
      const historyList = await fetchMatchHistoryList(player);
      if (!historyList || historyList.length === 0) {
        return await interaction.editReply(`❌ 查無玩家 **${player}** 的歷史戰績資料`);
      }

      const options = historyList.map((match, i) => ({
        label: `第 ${i + 1} 場`,
        description: `對局 ID: ${match.id}`,
        value: `${i}|${match.id}|${match.heroId || 'unknown'}`,
      }));

      const firstMatchDetail = await fetchMatchDetail(historyList[0].id);
      if (!firstMatchDetail) {
        return await interaction.editReply('❌ 無法取得第一場詳細戰績');
      }

      const embed = createMatchEmbed(player, 1, historyList.length, firstMatchDetail);
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('matchSelect')
        .setPlaceholder('選擇要查看的場次')
        .addOptions(options);
      const row = new ActionRowBuilder().addComponents(selectMenu);

      const replyMsg = await interaction.editReply({ embeds: [embed], components: [row] });

      const filter = i => i.user.id === interaction.user.id && i.customId === 'matchSelect';
      const collector = replyMsg.createMessageComponentCollector({
        filter,
        componentType: ComponentType.StringSelect,
        time: 60000,
      });

      collector.on('collect', async i => {
        const [indexStr, matchID] = i.values[0].split('|');
        const index = parseInt(indexStr, 10);
        await i.deferUpdate();

        const matchDetail = await fetchMatchDetail(matchID);
        if (!matchDetail) {
          return i.editReply({ content: '❌ 無法取得該場戰績', components: [] });
        }

        const newEmbed = createMatchEmbed(player, index + 1, historyList.length, matchDetail);
        await i.editReply({ embeds: [newEmbed], components: [row] });
      });

      collector.on('end', async () => {
        const disabledRow = new ActionRowBuilder().addComponents(selectMenu.setDisabled(true));
        try {
          await interaction.editReply({ components: [disabledRow] });
        } catch {}
      });

    } catch (err) {
      console.error('❌ 查詢歷史戰績發生錯誤:', err);
      await interaction.editReply(`❌ 發生錯誤：${err.message}`);
    }
  },
};
