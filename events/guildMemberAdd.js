const GuildConfig = require("../models/GuildConfig");

module.exports = {
  name: "guildMemberAdd",
  async execute(member) {
    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config) return;

    const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
    const defaultRole = member.guild.roles.cache.get(config.defaultRoleId);

    if (welcomeChannel) {
      welcomeChannel.send(`🎉 歡迎 <@${member.id}> 加入伺服器！`);
    }

    if (defaultRole) {
      member.roles.add(defaultRole).catch(console.error);
    }
  },
};
