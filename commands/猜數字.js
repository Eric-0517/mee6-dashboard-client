const {
  SlashCommandBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('猜數字')
    .setDescription('來玩猜數字遊戲（1~100）'),

  async execute(interaction) {
    const answer = Math.floor(Math.random() * 100) + 1;

    const modal = new ModalBuilder()
      .setCustomId(`guessNumberModal_${answer}`)
      .setTitle('猜數字遊戲');

    const input = new TextInputBuilder()
      .setCustomId('guessInput')
      .setLabel('請輸入你猜的數字 (1~100)')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));

    // ❗ 只能有這個，不能有任何 reply()
    await interaction.showModal(modal);
  }
};
