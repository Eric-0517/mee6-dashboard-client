const sampleSentences = [
  '今天天氣真好',
  '我愛程式設計',
  '打字速度比快',
  '歡迎來到打字比賽',
  'Discord Bot 開發真有趣'
];

module.exports = {
  start(interaction) {
    const sentence = sampleSentences[Math.floor(Math.random() * sampleSentences.length)];

    interaction.reply({
      content: `🏁 **打字比賽開始！**\n請盡快輸入下列句子：\n\n\`${sentence}\``,
      fetchReply: true
    });

    const filter = m => m.content === sentence && !m.author.bot;
    const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

    collector.on('collect', msg => {
      interaction.followUp(`🎉 ${msg.author} 率先完成輸入！恭喜獲勝！`);
      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) interaction.followUp('⏰ 時間到，沒有人完成輸入。');
    });
  }
};
