const idioms = [
  '一心一意', '三心二意', '亡羊補牢', '畫蛇添足', '井底之蛙'
];

function getHint(word) {
  const i = Math.floor(Math.random() * 4);
  return word.split('').map((char, idx) => (idx === i ? char : '＿')).join('');
}

module.exports = {
  start(interaction) {
    const answer = idioms[Math.floor(Math.random() * idioms.length)];
    const hint = getHint(answer);

    interaction.reply({
      content: `🧠 **成語填空遊戲**\n請根據提示猜出成語：\n\`${hint}\``,
      fetchReply: true
    });

    const filter = m => m.content === answer && !m.author.bot;
    const collector = interaction.channel.createMessageCollector({ filter, time: 20000 });

    collector.on('collect', msg => {
      interaction.followUp(`🎉 ${msg.author} 猜對了！答案是：\`${answer}\``);
      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) interaction.followUp(`😢 沒有人猜中，答案是：\`${answer}\``);
    });
  }
};
