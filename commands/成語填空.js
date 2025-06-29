const { SlashCommandBuilder } = require('discord.js');

const idioms = [
  { question: '畫__添足', answer: '蛇' },
  { question: '對牛__琴', answer: '彈' },
  { question: '亡__補牢', answer: '羊' },
  { question: '__耳盜鈴', answer: '掩' },
  { question: '刻舟求__', answer: '劍' }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('成語填空')
    .setDescription('從選項中選出正確字填入空格'),
  async execute(interaction) {
    const item = idioms[Math.floor(Math.random() * idioms.length)];
    await interaction.reply(`🧠 成語填空：\n\`${item.question}\`\n請在聊天中猜出正確的字！答案：${item.answer}（開發階段展示用）`);
  },
};
