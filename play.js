const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const playdl = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
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

    const isValid = await playdl.validate(url);
    if (!isValid) {
      return interaction.reply('❌ 這不是有效的 YouTube 連結！');
    }

    // 取得音訊串流
    const stream = await playdl.stream(url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
    });

    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    player.play(resource);
    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    await interaction.reply(`▶️ 正在播放：${url}`);
  },
};
