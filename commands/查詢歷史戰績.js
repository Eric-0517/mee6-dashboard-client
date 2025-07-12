const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { fetchMatchHistoryListByName, fetchMatchDetail } = require('../utils/aovStats');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績')
    .setDescription('透過玩家名稱查詢傳說對決歷史戰績')
    .addStringOption(option =>
      option.setName('playername')
        .setDescription('玩家名稱')
        .setRequired(true)),

  async execute(interaction) {
    const playerName = interaction.options.getString('playername');

    await interaction.deferReply();

    // 取得戰績列表（多場）
    const matchList = await fetchMatchHistoryListByName(playerName);
    if (!matchList || matchList.length === 0) {
      await interaction.editReply('❌ 查無戰績資料，請確認玩家名稱是否正確。');
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
      desc += detail.players.map((p) => {
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

    // 監聽選單互動
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
