const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { getLeaderboard } = require('../utils/aovStats'); // 使用整合好的新 API

const PAGE_SIZE = 50;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢排行榜')
    .setDescription('查詢排位排行榜')
    .addIntegerOption(option =>
      option.setName('伺服器')
        .setDescription('選擇伺服器')
        .setRequired(true)
        .addChoices(
          { name: '聖騎之王（1服）', value: 1011 },
          { name: '純潔之翼（2服）', value: 1012 }
        )
    ),
  async execute(interaction) {
    const serverId = interaction.options.getInteger('伺服器');
    const players = await getLeaderboard(serverId);

    if (!players || players.length === 0) {
      return interaction.reply('❌ 查無排行榜資料');
    }

    const totalPages = Math.ceil(players.length / PAGE_SIZE);

    const getPageEmbed = (page) => {
      const start = (page - 1) * PAGE_SIZE;
      const pagePlayers = players.slice(start, start + PAGE_SIZE);
      const description = pagePlayers.map((p, i) => {
        return `**${start + i + 1}. ${p.name}**｜${p.rankName}｜${p.score}分`;
      }).join('\n');

      return new EmbedBuilder()
        .setTitle(`傳說對決 排位排行榜｜伺服器 ${serverId === 1011 ? '聖騎之王' : '純潔之翼'}`)
        .setDescription(description)
        .setFooter({ text: `第 ${page} / ${totalPages} 頁` })
        .setColor('#FFD700');
    };

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('rank_page_select')
      .setPlaceholder('選擇頁數')
      .addOptions([...Array(totalPages).keys()].map(i => ({
        label: `第 ${i + 1} 頁`,
        value: `${i + 1}`,
      })));

    await interaction.reply({
      embeds: [getPageEmbed(1)],
      components: [new ActionRowBuilder().addComponents(selectMenu)],
      ephemeral: false
    });

    const collector = interaction.channel.createMessageComponentCollector({
      time: 60_000,
      filter: i => i.customId === 'rank_page_select' && i.user.id === interaction.user.id
    });

    collector.on('collect', async i => {
      const page = parseInt(i.values[0]);
      await i.update({
        embeds: [getPageEmbed(page)],
        components: [new ActionRowBuilder().addComponents(selectMenu)]
      });
    });

    collector.on('end', () => {
      interaction.editReply({ components: [] });
    });
  }
};
