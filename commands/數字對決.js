const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('數字對決')
    .setDescription('與機器人比大小數字'),
  async execute(interaction) {
    try {
      const user = Math.floor(Math.random() * 100) + 1;
      const bot = Math.floor(Math.random() * 100) + 1;
      const winner = user > bot ? '你贏了 🎉' : user < bot ? '你輸了 😢' : '平手 🤝';

      await interaction.reply(`🎲 你擲出了 **${user}**\n🤖 機器擲出了 **${bot}**\n🏆 結果：${winner}`);
    } catch (error) {
      console.error('❌ 數字對決指令錯誤：', error);
      if (!interaction.replied) {
        await interaction.reply({ content: '執行指令時發生錯誤 ❌', ephemeral: true });
      }
    }
  }
};
