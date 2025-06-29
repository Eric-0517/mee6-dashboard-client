const GuildConfig = require("../models/GuildConfig");

module.exports = {
  name: "guildMemberRemove",
  async execute(member) {
    const config = await GuildConfig.findOne({ guildId: member.guild.id });
    if (!config) return;

    const leaveChannel = member.guild.channels.cache.get(config.leaveChannelId);

    if (leaveChannel) {
      leaveChannel.send(`👋 ${member.user.tag} 離開了伺服器。`);
    }
  },
};
