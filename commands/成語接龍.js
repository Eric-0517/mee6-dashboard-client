const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('成語接龍')
    .setDescription('與機器人進行成語接龍（開發中，隨機生成成語）'),

  async execute(interaction) {
    const idioms = ['一心一意', '意氣風發', '發光發熱', '熱火朝天', '天馬行空', '空前絕後'];
    const idiom = idioms[Math.floor(Math.random() * idioms.length)];
    const lastChar = idiom[idiom.length - 1];

    // 先回覆成語及提示
    await interaction.reply(`🎯 請接龍：「${idiom}」的最後一個字「${lastChar}」開頭的成語！`);

    // 建立 Modal
    const modal = new ModalBuilder()
      .setCustomId('idiomChainModal')
      .setTitle('成語接龍回覆');

    const input = new TextInputBuilder()
      .setCustomId('userIdiom')
      .setLabel(`請輸入以「${lastChar}」開頭的成語`)
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('輸入你的成語...')
      .setRequired(true);

    const row = new ActionRowBuilder().addComponents(input);
    modal.addComponents(row);

    // 顯示 Modal 給使用者
    await interaction.showModal(modal);
  }
};
