const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('更新日誌')
    .setDescription('查看機器人的更新紀錄'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📒 更新日誌')
      .setColor(0x00bfff)
      .setDescription([
        '※ 5/28 機器人誕生！',
        '※ 5/29 逐步新增機器人指令及功能！',
        '※ 5/30 機器人排除 Bug 中！',
        '※ 6/05 暫時關閉機器人進行維護！',
        '※ 6/22 新增小遊戲共計14個！'
      ].join('\n'))
      .setFooter({ text: '最後更新時間：6/22' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
