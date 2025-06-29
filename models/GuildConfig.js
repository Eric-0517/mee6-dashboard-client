// models/GuildConfig.js
const mongoose = require('mongoose');

const guildConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  welcomeChannelId: String,
  leaveChannelId: String,
  defaultRoleId: String,
});

module.exports = mongoose.model('GuildConfig', guildConfigSchema);
