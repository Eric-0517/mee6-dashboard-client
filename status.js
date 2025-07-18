const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');
const moment = require('moment');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('📊 查看機器人完整狀態'),

  async execute(interaction) {
    const client = interaction.client;
    const uptime = client.uptime;

    // 運行時間格式化
    const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
    const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((uptime / (1000 * 60)) % 60);
    const seconds = Math.floor((uptime / 1000) % 60);

    const formattedUptime = `${days} 天 ${hours} 時 ${minutes} 分 ${seconds} 秒`;

    // 開機時間
    const bootTime = Date.now() - uptime;
    const formattedBootTime = moment(bootTime).format('YYYY-MM-DD HH:mm:ss');

    // 系統資訊
    const memoryUsageMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    const totalMemoryMB = (os.totalmem() / 1024 / 1024).toFixed(0);
    const platform = os.platform();
    const loadAverage = os.loadavg()[0].toFixed(2);

    // Bot 狀態
    const totalGuilds = client.guilds.cache.size;
    const ping = client.ws.ping;
    const nodeVersion = process.version;
    const discordJsVersion = require('discord.js').version;

    const embed = new EmbedBuilder()
      .setColor(0x00FF88)
      .setTitle('📡 機器人狀態報告')
      .setThumbnail(client.user.displayAvatarURL())
      .addFields(
        { name: '🟢 狀態', value: '線上', inline: true },
        { name: '📶 延遲', value: `${ping} ms`, inline: true },
        { name: '🏠 所在群組數', value: `${totalGuilds}`, inline: true },

        { name: '⏱️ 運行時間', value: formattedUptime, inline: true },
        { name: '📅 開機時間', value: formattedBootTime, inline: true },
        { name: '🧠 記憶體使用', value: `${memoryUsageMB} MB / ${totalMemoryMB} MB`, inline: true },

        { name: '🖥️ 作業系統', value: platform, inline: true },
        { name: '🧮 CPU 負載 (1分鐘)', value: `${loadAverage}`, inline: true },
        { name: '⚙️ Node.js 版本', value: nodeVersion, inline: true },
        { name: '🤖 Discord.js 版本', value: discordJsVersion, inline: true },
      )
      .setFooter({
        text: `機器人 ID：${client.user.id} ｜如有問題請聯絡：0147zeo@gmail.com`,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
