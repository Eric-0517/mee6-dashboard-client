const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績_uid')
    .setDescription('使用 UID 查詢《傳說對決》戰績')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('請輸入玩家 UID')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('伺服器')
        .setDescription('請選擇伺服器')
        .setRequired(true)
        .addChoices(
          { name: '聖騎之王', value: 1011 },
          { name: '純潔之翼', value: 1012 }
        )
    ),

  async execute(interaction) {
    const uid = interaction.options.getString('uid');
    const dwLogicWorldId = interaction.options.getInteger('伺服器');

    await interaction.deferReply();

    try {
      const res = await axios.get('https://aovweb.azurewebsites.net/api/Player/GetPlayerInfoByUid', {
        params: { uid, dwLogicWorldId }
      });

      const data = res.data;

      const embed = {
        color: 0x00bfff,
        title: `🎮 UID 戰績查詢`,
        fields: [
          { name: '暱稱', value: data.nickname || '未知', inline: true },
          { name: 'UID', value: data.uid || '未知', inline: true },
          { name: '段位', value: data.rank || '未知', inline: true },
          { name: '勝率', value: `${data.winRate || '未知'}%`, inline: true },
          { name: 'MVP 次數', value: `${data.mvp || '未知'}`, inline: true }
        ],
        footer: { text: `伺服器代碼：${dwLogicWorldId}` }
      };

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply(`❌ 查詢失敗，請確認 UID 是否正確。`);
    }
  }
};
