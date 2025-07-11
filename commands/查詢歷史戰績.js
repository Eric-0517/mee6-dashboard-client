const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType,
  EmbedBuilder
} = require('discord.js');

const {
  fetchMatchHistoryListByUID,
  fetchMatchDetail
} = require('../utils/aovStats');

function createMatchEmbed(uid, serverId, index, total, match) {
  const teammates = Array.isArray(match.teammates) ? match.teammates.join('\n') : '無隊友資料';
  const opponents = Array.isArray(match.opponents) ? match.opponents.join('\n') : '無敵隊資料';
  const stats = match.stats && typeof match.stats === 'object'
    ? Object.entries(match.stats).map(([k, v]) => `${k}: ${v}`).join('\n')
    : '無詳細數據';

  const heroHeadUrl = match.heroId
    ? `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${match.heroId}head.jpg`
    : null;

  const serverName = serverId === 1011 ? '聖騎之王（1服）' : serverId === 1012 ? '純潔之翼（2服）' : `伺服器 ${serverId}`;

  const embed = new EmbedBuilder()
    .setTitle(`UID ${uid} 的歷史戰績`)
    .setDescription(`第 ${index}/${total} 場 - 對局ID：${match.id || '無'}\n伺服器：${serverName}`)
    .addFields(
      { name: '評分（名次）', value: match.rank || '無', inline: true },
      { name: '隊友', value: teammates, inline: false },
      { name: '敵隊', value: opponents, inline: false },
      { name: '詳細數據', value: stats, inline: false }
    )
    .setColor('#0099ff')
    .setTimestamp();

  if (heroHeadUrl) embed.setThumbnail(heroHeadUrl);

  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績_uid')
    .setDescription('使用 UID 和伺服器 ID 查詢歷史戰績')
    .addStringOption(opt =>
      opt.setName('uid')
        .setDescription('玩家 UID')
        .setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName('serverid')
        .setDescription('伺服器 ID（1011=聖騎之王，1012=純潔之翼）')
        .setRequired(true)
    ),

  async execute(interaction) {
    const uid = interaction.options.getString('uid');
    const serverId = interaction.options.getInteger('serverid');

    await interaction.deferReply();

    try {
      const historyList = await fetchMatchHistoryListByUID(uid, serverId);

      if (!historyList || historyList.length === 0) {
        return await interaction.editReply(`❌ 查無 UID ${uid} 的歷史戰績資料`);
      }

      const options = historyList.map((match, i) => ({
        label: `第${i + 1}場`,
        description: `對局ID: ${match.id}`,
        value: `${i}|${match.id}|${match.heroId || 'unknown'}`
      }));

      const firstMatchDetail = await fetchMatchDetail(historyList[0].id);

      if (!firstMatchDetail) {
        return await interaction.editReply('❌ 無法取得第一場詳細戰績');
      }

      const embed = createMatchEmbed(uid, serverId, 1, historyList.length, firstMatchDetail);

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
        time: 60000
      });

      collector.on('collect', async i => {
        const [indexStr, matchID] = i.values[0].split('|');
        const index = parseInt(indexStr, 10);

        await i.deferUpdate();

        try {
          const matchDetail = await fetchMatchDetail(matchID);
          if (!matchDetail) {
            return i.editReply({ content: '❌ 取得該場戰績失敗', embeds: [], components: [] });
          }

          const newEmbed = createMatchEmbed(uid, serverId, index + 1, historyList.length, matchDetail);
          await i.editReply({ embeds: [newEmbed], components: [row] });
        } catch (err) {
          console.error('選單互動錯誤:', err);
          try {
            await i.editReply({ content: '❌ 發生錯誤，請稍後再試', components: [] });
          } catch {}
        }
      });

      collector.on('end', async () => {
        try {
          const disabledRow = new ActionRowBuilder().addComponents(selectMenu.setDisabled(true));
          await interaction.editReply({ components: [disabledRow] });
        } catch (err) {
          // 忽略互動過期
        }
      });

    } catch (err) {
      console.error('查詢歷史戰績發生錯誤:', err);
      try {
        await interaction.editReply(`❌ 發生錯誤：${err.message}`);
      } catch {}
    }
  }
};
