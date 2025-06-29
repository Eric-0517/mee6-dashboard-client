const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢角色偏好')
    .setDescription('查詢玩家常用英雄')
    .addStringOption(option =>
      option.setName('uid')
        .setDescription('玩家 UID')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('伺服器')
        .setDescription('伺服器代碼')
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
      const res = await axios.get('https://aovweb.azurewebsites.net/api/Player/GetPlayerHeroInfo', {
        params: { uid, dwLogicWorldId }
      });

      const topHeroes = res.data.data.slice(0, 5)
        .map(h => `${h.heroName}：${h.matchCount} 場，勝率 ${h.winRate}%`)
        .join('\n');

      await interaction.editReply(`👑 最常用英雄（前 5）：\n${topHeroes}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ 查詢失敗，請確認資料是否正確。');
    }
  }
};
