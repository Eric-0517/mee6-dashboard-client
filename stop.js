const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription('停止播放並離開語音頻道'),
  async execute(interaction) {
    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      return interaction.reply('❌ 我目前不在語音頻道中。');
    }

    connection.destroy();
    await interaction.reply('🛑 已停止播放並離開語音頻道。');
  },
};
