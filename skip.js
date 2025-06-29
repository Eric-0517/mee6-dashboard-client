// commands/music/skip.js
const { SlashCommandBuilder } = require('discord.js');
const { queues, playSong } = require('../../utils/musicQueue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription('⏭ 跳過目前正在播放的歌曲'),
  async execute(interaction) {
    const queue = queues.get(interaction.guild.id);
    if (!queue || !queue.songs.length) {
      return interaction.reply('⚠️ 沒有正在播放的歌曲可以跳過。');
    }

    queue.player.stop(true); // 觸發 Idle 事件，自動播放下一首
    await interaction.reply('⏭ 已跳過歌曲！');
  },
};
