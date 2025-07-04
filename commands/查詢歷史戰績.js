const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('查詢歷史戰績')
    .setDescription('查詢玩家最近 10 場對戰記錄')
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
      const res = await axios.get('https://aovweb.azurewebsites.net/api/Player/GetBattleList', {
        params: { uid, dwLogicWorldId }
      });

      const battles = res.data.data.slice(0, 5)
        .map((b, i) => `${i + 1}. ${b.heroName} - ${b.battleResult}（${b.kda}）`)
        .join('\n');

      await interaction.editReply(`📜 最近戰績（前 5 場）：\n${battles}`);
    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ 查詢失敗，請確認 UID 與伺服器代碼。');
    }
  }
};
