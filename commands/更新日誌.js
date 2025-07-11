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
        '※ 至以下連結查看',
        '※ https://www.laborbot.dpdns.org/資源/更新日誌'
      ].join('\n'))
      .setFooter({ text: '最後更新時間：6/22' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
