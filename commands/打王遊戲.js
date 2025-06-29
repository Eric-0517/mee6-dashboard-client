const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('打王遊戲')
    .setDescription('挑戰強大的 BOSS！'),
  async execute(interaction) {
    const damage = Math.floor(Math.random() * 100) + 1;
    const result = damage > 70 ? '🎉 你擊敗了 BOSS！' : '😢 你被 BOSS 擊退了...';
    await interaction.reply(`🗡️ 你造成了 ${damage} 點傷害！\n${result}`);
  }
};
