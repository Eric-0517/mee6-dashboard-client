const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../data/welcomeConfig.json');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    const guildId = member.guild.id;

    // 若設定檔不存在或未設定頻道
    if (!fs.existsSync(configPath)) return;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const channelId = config[guildId];
    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    const avatarUrl = member.user.displayAvatarURL({ format: 'png', size: 512 });

    const embed = new EmbedBuilder()
      .setColor('#00FFFF')
      .setTitle('🎉 Welcome to the Server!')
      .setDescription(`${member} 歡迎加入我們的伺服器！`)
      .setImage(avatarUrl)
      .setTimestamp()
      .setFooter({ text: `用戶 ID：${member.id}` });

    await channel.send({ embeds: [embed] });
  }
};
