// commands/music/queue.js
const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../../utils/musicQueue');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription('📜 顯示目前播放隊列'),
  async execute(interaction) {
    const queue = queues.get(interaction.guild.id);
    if (!queue || queue.songs.length === 0) {
      return interaction.reply('📭 播放隊列是空的。');
    }

    const list = queue.songs.map((s, i) => `${i === 0 ? '🎵' : '➖'} ${s.title}`).join('\n');
    await interaction.reply(`📜 **播放隊列：**\n${list}`);
  },
};
