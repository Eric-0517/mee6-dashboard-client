// commands/music/pause.js
const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../../utils/musicQueue');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription('⏸ 暫停音樂播放'),
  async execute(interaction) {
    const queue = queues.get(interaction.guild.id);
    if (!queue || queue.player.state.status !== AudioPlayerStatus.Playing) {
      return interaction.reply('⚠️ 目前沒有播放中的音樂。');
    }

    queue.player.pause();
    await interaction.reply('⏸ 已暫停播放。');
  },
};
