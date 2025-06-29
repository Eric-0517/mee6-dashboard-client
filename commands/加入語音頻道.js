const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('加入語音頻道')
    .setDescription('讓機器人加入你的語音頻道'),
  async execute(interaction) {
    // 確保 interaction 來自 guild 且使用者在語音頻道
    const member = interaction.guild.members.cache.get(interaction.user.id);
    const channel = member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: '⚠️ 請先加入語音頻道！',
        ephemeral: true,
      });
    }

    try {
      joinVoiceChannel({
        channelId: channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      await interaction.reply(`✅ 已加入語音頻道：**${channel.name}**`);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: '❌ 加入語音頻道時發生錯誤！',
        ephemeral: true,
      });
    }
  },
};
