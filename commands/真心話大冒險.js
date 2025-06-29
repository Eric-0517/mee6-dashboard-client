const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('真心話')
    .setDescription('抽出一題真心話'),
  async execute(interaction) {
    const questions = [
      '你暗戀過的人是誰？',
      '你曾經做過最瘋狂的事是什麼？',
      '你最怕失去的人是誰？'
    ];
    const q = questions[Math.floor(Math.random() * questions.length)];
    await interaction.reply(`❤️ 真心話題目：\n${q}`);
  }
};
