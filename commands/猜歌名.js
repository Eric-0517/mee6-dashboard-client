const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const playdl = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('猜歌')
    .setDescription('播放 YouTube 音樂片段讓大家猜歌名')
    .addStringOption(option =>
      option.setName('url')
        .setDescription('YouTube 音樂連結')
        .setRequired(true)),
  async execute(interaction) {
    const url = interaction.options.getString('url');
    const channel = interaction.member.voice.channel;
    if (!channel) return interaction.reply('⚠️ 請先加入語音頻道');

    const ytInfo = await playdl.video_info(url);
    const stream = await playdl.stream(url);

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    const resource = createAudioResource(stream.stream, {
      inputType: stream.type
    });

    player.play(resource);
    connection.subscribe(player);

    await interaction.reply(`🎵 播放中：**${ytInfo.video_details.title}**，來猜看看是什麼歌吧！`);
  }
};