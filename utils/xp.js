
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
});

const roleRewardSchema = new mongoose.Schema({
    guildId: String,
    level: Number,
    roleId: String
});

const User = mongoose.model('User', userSchema);
const RoleReward = mongoose.model('RoleReward', roleRewardSchema);

async function addXP(guildId, userId, amount, client) {
    let user = await User.findOne({ guildId, userId });
    if (!user) {
        user = new User({ guildId, userId });
    }

    user.xp += amount;
    const neededXP = user.level * 100;

    if (user.xp >= neededXP) {
        user.level++;
        user.xp = user.xp - neededXP;

        // 發送升級通知
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);
        const channel = guild.systemChannel || guild.channels.cache.find(c => c.isTextBased && c.permissionsFor(guild.members.me).has('SendMessages'));
        if (channel) {
            channel.send(`🎉 恭喜 ${member.user.username} 升到等級 ${user.level}！`);
        }

        // 發放角色（如果該等級有對應角色）
        const reward = await RoleReward.findOne({ guildId, level: user.level });
        if (reward) {
            const role = guild.roles.cache.get(reward.roleId);
            if (role) {
                await member.roles.add(role);
                if (channel) {
                    channel.send(`✅ 已為 ${member.user.username} 授予角色：${role.name}`);
                }
            }
        }
    }

    await user.save();
    return user;
}

module.exports = { addXP, User, RoleReward };
