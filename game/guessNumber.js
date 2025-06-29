module.exports = {
  start(interaction) {
    const answer = Math.floor(Math.random() * 100) + 1;

    interaction.reply({
      content: `🔢 **猜數字遊戲開始！**\n請在 1 到 100 之間猜一個數字。你可以多次嘗試，直到猜中或超時（30 秒）。`,
      fetchReply: true
    });

    const filter = m => !isNaN(m.content) && !m.author.bot;
    const collector = interaction.channel.createMessageCollector({ filter, time: 30000 });

    collector.on('collect', msg => {
      const guess = parseInt(msg.content);
      if (guess === answer) {
        interaction.followUp(`🎉 ${msg.author} 猜對了！答案就是 **${answer}**！`);
        collector.stop();
      } else if (guess < answer) {
        msg.reply('🔼 太小了，再試一次！');
      } else {
        msg.reply('🔽 太大了，再試一次！');
      }
    });

    collector.on('end', collected => {
      if (![...collected.values()].some(m => parseInt(m.content) === answer)) {
        interaction.followUp(`😢 沒有人猜中。正確答案是：**${answer}**`);
      }
    });
  }
};
