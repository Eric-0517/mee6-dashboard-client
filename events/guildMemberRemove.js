const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const configPath = path.resolve(__dirname, '../data/leaveConfig.json');

module.exports = {
  name: 'guildMemberRemove',
  async execute(member) {
    const guildId = member.guild.id;

    if (!fs.existsSync(configPath)) return;
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const channelId = config[guildId];
    if (!channelId) return;

    const channel = await member.guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    const avatarUrl = member.user.displayAvatarURL({ format: 'png', size: 512 });

    const embed = new EmbedBuilder()
      .setColor('#FF4444')
      .setTitle('👋 成員離開了伺服器')
      .setDescription(`${member.user.tag} 已離開本伺服器`)
      .setThumbnail(avatarUrl)
      .setTimestamp()
      .setFooter({ text: `用戶 ID：${member.id}` });

    await channel.send({ embeds: [embed] });
  }
};
