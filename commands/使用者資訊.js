const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('使用者資訊')
    .setDescription('取得某位使用者的資訊')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('要查詢的使用者')
        .setRequired(false)),
  async execute(interaction) {
    const user = interaction.options.getUser('target') || interaction.user;
    const member = await interaction.guild.members.fetch(user.id);

    await interaction.reply({
      embeds: [{
        title: `${user.tag} 的資訊`,
        fields: [
          { name: '用戶 ID', value: user.id, inline: true },
          { name: '帳號建立時間', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:F>`, inline: false },
          { name: '加入伺服器時間', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`, inline: false },
        ],
        thumbnail: { url: user.displayAvatarURL() },
        color: 0x00AE86
      }]
    });
  },
};
