
const { Events } = require('discord.js');
const { addXP } = require('../../utils/xp');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;
        if (!message.guild) return;

        await addXP(message.guild.id, message.author.id, 10, message.client);
    }
};
