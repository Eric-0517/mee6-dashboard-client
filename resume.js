// commands/music/resume.js
const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../../utils/musicQueue');
const { AudioPlayerStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription('▶️ 繼續播放暫停的音樂'),
  async execute(interaction) {
    const queue = queues.get(interaction.guild.id);
    if (!queue || queue.player.state.status !== AudioPlayerStatus.Paused) {
      return interaction.reply('⚠️ 沒有暫停中的音樂可繼續播放。');
    }

    queue.player.unpause();
    await interaction.reply('▶️ 已繼續播放。');
  },
};
