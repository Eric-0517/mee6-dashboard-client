const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢戰績')
    .setDescription('查詢《傳說對決》玩家戰績（輸入玩家名稱）')
    .addStringOption(option =>
      option.setName('名稱')
        .setDescription('請輸入玩家名稱')
        .setRequired(true)
    ),

  async execute(interaction) {
    const playerName = interaction.options.getString('名稱');
    await interaction.deferReply();

    try {
      const res = await axios.get('https://aovweb.azurewebsites.net/api/Player/GetPlayerInfo', {
        params: { playerName }
      });

      const data = res.data;

      const embed = {
        color: 0x00bfff,
        title: `📊 玩家戰績查詢`,
        fields: [
          { name: '暱稱', value: data.nickname || '未知', inline: true },
          { name: 'UID', value: data.uid || '未知', inline: true },
          { name: '段位', value: data.rank || '未知', inline: true },
          { name: '勝率', value: `${data.winRate || '未知'}%`, inline: true },
          { name: 'MVP 次數', value: `${data.mvp || '未知'}`, inline: true }
        ],
        footer: { text: '資料來源：aovweb.azurewebsites.net' }
      };

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply(`❌ 查無資料，請確認名稱「${playerName}」是否正確。`);
    }
  }
};
