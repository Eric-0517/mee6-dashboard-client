const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('播放')
    .setDescription('播放 YouTube 音樂')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube 音樂連結')
        .setRequired(true)),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    const channel = interaction.member.voice.channel;

    if (!channel) {
      return interaction.reply('⚠️ 請先加入語音頻道！');
    }

    if (!ytdl.validateURL(url)) {
      return interaction.reply('❌ 這不是有效的 YouTube 連結！');
    }

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const stream = ytdl(url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    const player = createAudioPlayer();

    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.reply(`▶️ 開始播放音樂：${url}`);
  },
};
