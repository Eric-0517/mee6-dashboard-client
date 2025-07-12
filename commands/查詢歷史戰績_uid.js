const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { fetchMatchHistoryListByUID, fetchMatchDetail } = require('../utils/aovStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績_uid')
    .setDescription('透過 UID 查詢傳說對決歷史戰績')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('玩家UID')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('server')
        .setDescription('選擇伺服器')
        .setRequired(true)
        .addChoices(
          { name: '聖騎之王', value: '1011' },
          { name: '純潔之翼', value: '1012' },
        )),

  async execute(interaction) {
    const uid = interaction.options.getString('uid');
    const serverId = interaction.options.getString('server');

    await interaction.deferReply();

    try {
      const matchList = await fetchMatchHistoryListByUID(uid, serverId);
      if (!matchList || matchList.length === 0) {
        await interaction.editReply('❌ 查無戰績資料，請確認 UID 與伺服器是否正確。');
        return;
      }

      let currentIndex = 0;
      let matchDetail = await fetchMatchDetail(matchList[currentIndex].id);
      if (!matchDetail) {
        await interaction.editReply('❌ 無法取得該場戰績詳細資料。');
        return;
      }

      // 建立 embed 輸出函式
      function buildMatchEmbed(detail) {
        const embed = new EmbedBuilder()
          .setTitle(`第 ${currentIndex + 1} 場戰績 - 對局ID: ${detail.matchId}`)
          .setDescription(`對局時間：${detail.matchTime}\n模式：${detail.mode}\n勝負：${detail.isWin ? '勝利' : '失敗'}`)
          .setColor(detail.isWin ? 0x00ff00 : 0xff0000)
          .setFooter({ text: `UID: ${uid} | 伺服器: ${serverId}` });

        detail.players.forEach(p => {
          const heroHeadUrl = `https://dl.ops.kgtw.garenanow.com/CHT/HeroHeadPath/${p.heroId}head.jpg`;

          let fieldValue =
            `Lv.${p.level} | ${p.name} (${p.vip})\n` +
            `KDA: ${p.kda} | 評分: ${p.score} (${p.rank})\n` +
            `裝備: ${p.equips.length > 0 ? p.equips.join(' ') : '無'}\n` +
            `輸出: ${p.output} | 承傷: ${p.damageTaken} | 經濟: ${p.economy}\n` +
            `補兵: ${p.cs} | 硬控: ${p.hardControl} | 治療: ${p.heal} | 塔傷: ${p.towerDamage}\n` +
            `隊伍顏色: ${p.teamColor === 'blue' ? '🟦 藍隊' : '🟥 紅隊'}`;

          embed.addFields({ name: `英雄: ${p.heroName}`, value: fieldValue, inline: false });
        });

        return embed;
      }

      const embed = buildMatchEmbed(matchDetail);

      // 建立場次選單
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_match')
        .setPlaceholder('選擇場次')
        .addOptions(
          matchList.map((match, index) => ({
            label: `第${index + 1} 場`,
            description: `英雄ID: ${match.heroId || '未知'}`,
            value: index.toString(),
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      // 回覆並取得訊息物件
      const replyMessage = await interaction.editReply({ embeds: [embed], components: [row] });

      const filter = i => i.customId === 'select_match' && i.user.id === interaction.user.id;
      const collector = replyMessage.createMessageComponentCollector({ filter, time: 60000 });

      collector.on('collect', async i => {
        const idx = parseInt(i.values[0], 10);
        if (idx === currentIndex) {
          await i.update({ embeds: [embed], components: [row] });
          return;
        }
        currentIndex = idx;
        matchDetail = await fetchMatchDetail(matchList[currentIndex].id);
        if (!matchDetail) {
          await i.update({ content: '❌ 無法取得該場戰績詳細資料。', embeds: [], components: [] });
          return;
        }
        const newEmbed = buildMatchEmbed(matchDetail);
        await i.update({ embeds: [newEmbed], components: [row] });
      });

      collector.on('end', async () => {
        try {
          await interaction.editReply({ components: [] }); // 超時移除選單
        } catch {}
      });

    } catch (error) {
      console.error('查詢歷史戰績錯誤:', error);
      await interaction.editReply('❌ 查詢發生錯誤，請稍後再試。');
    }
  },
};
