const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
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
        .setDescription('伺服器ID (1011 聖騎之王 / 1012 純潔之翼)')
        .setRequired(true)),

  async execute(interaction) {
    const uid = interaction.options.getString('uid');
    const serverId = interaction.options.getString('server');

    await interaction.deferReply();

    // 取得戰績列表（多場）
    const matchList = await fetchMatchHistoryListByUID(uid, serverId);
    if (!matchList || matchList.length === 0) {
      await interaction.editReply('❌ 查無戰績資料，請確認 UID 與伺服器是否正確。');
      return;
    }

    // 預設顯示第一場詳細資料
    let currentIndex = 0;
    let matchDetail = await fetchMatchDetail(matchList[currentIndex].id);
    if (!matchDetail) {
      await interaction.editReply('❌ 無法取得該場戰績詳細資料。');
      return;
    }

    // 建立輸出字串函式
    function buildMatchDescription(detail) {
      let desc = `**對局時間：** ${detail.matchTime}\n\n`;
      desc += detail.players.map((p, i) => {
        const icon = p.teamColor === 'blue' ? '🟦' : '🟥';
        const heroIcon = p.heroId ? `:HeroIcon_${p.heroId}:` : '';
        const equips = p.equips.length > 0 ? p.equips.join(' ') : '無裝備資料';
        return `${icon} ${heroIcon} Lv.${p.level}\n玩家: ${p.name}\nUID: ${p.uid} (${p.server || '未知'}) | ${p.vip}\n` +
          `KDA: ${p.kda} | 評分: ${p.score} (${p.rank})\n裝備: ${equips}\n` +
          `輸出|承傷|經濟: ${p.output} | ${p.damageTaken} | ${p.economy}\n` +
          `補兵: ${p.cs} | 硬控場: ${p.hardControl} | 治療量: ${p.heal} | 塔傷: ${p.towerDamage}\n`;
      }).join('\n');

      if (detail.reportedPlayers && detail.reportedPlayers.length > 0) {
        desc += `\n[test]該玩家舉報的玩家：\n${detail.reportedPlayers.join('\n')}\n`;
      }

      return desc;
    }

    // 建立下拉選單給用戶選擇不同場次
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_match')
      .setPlaceholder('選擇場次')
      .addOptions(
        matchList.map((match, index) => ({
          label: `第${index + 1} 場 - ID: ${match.id}`,
          description: `英雄ID: ${match.heroId || '未知'}`,
          value: index.toString(),
        }))
      );

    const row = new ActionRowBuilder().addComponents(selectMenu);

    // 先回覆第一場戰績
    await interaction.editReply({
      content: buildMatchDescription(matchDetail),
      components: [row],
    });

    // 設置收集器監聽用戶選擇（可放在事件檔統一處理，以下示範寫法）
    // 這裡示範用 interaction.client 的 collector 方式，請根據你的 Bot 框架調整

    const filter = i => i.customId === 'select_match' && i.user.id === interaction.user.id;
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      const idx = parseInt(i.values[0], 10);
      if (idx === currentIndex) {
        await i.update({ content: buildMatchDescription(matchDetail), components: [row] });
        return;
      }
      currentIndex = idx;
      matchDetail = await fetchMatchDetail(matchList[currentIndex].id);
      if (!matchDetail) {
        await i.update({ content: '❌ 無法取得該場戰績詳細資料。', components: [] });
        return;
      }
      await i.update({ content: buildMatchDescription(matchDetail), components: [row] });
    });

    collector.on('end', async () => {
      try {
        await interaction.editReply({ components: [] }); // 超時取消選單
      } catch { }
    });
  },
};
