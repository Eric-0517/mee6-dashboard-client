const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const UndercoverGame = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('誰是臥底')
    .setDescription('開始誰是臥底遊戲'),

  async execute(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;

    // 若尚未建立遊戲，初始化
    if (!UndercoverGame.has(guildId)) {
      UndercoverGame.set(guildId, {
        host: userId,
        players: new Map(),
        started: false,
        words: ['太陽', '月亮'],
        undercoverCount: 1
      });
    }

    const game = UndercoverGame.get(guildId);
    const isHost = userId === game.host;

    const joinBtn = new ButtonBuilder().setCustomId('undercover_join').setLabel('✅ 加入遊戲').setStyle(ButtonStyle.Success);
    const startBtn = new ButtonBuilder().setCustomId('undercover_start').setLabel('🎲 開始遊戲').setStyle(ButtonStyle.Primary).setDisabled(!isHost);
    const leaveBtn = new ButtonBuilder().setCustomId('undercover_leave').setLabel('❌ 退出遊戲').setStyle(ButtonStyle.Danger);

    const actionRow = new ActionRowBuilder().addComponents(joinBtn, startBtn, leaveBtn);

    const embed = new EmbedBuilder()
      .setTitle('🎯 誰是臥底小遊戲')
      .setDescription('按下方按鈕來加入、開始或退出遊戲')
      .addFields({ name: '主持人', value: `<@${game.host}>`, inline: true });

    await interaction.reply({ embeds: [embed], components: [actionRow] });
  }
};

// 互動按鈕處理
module.exports.buttonHandlers = async (interaction) => {
  const guildId = interaction.guild.id;
  const userId = interaction.user.id;
  const game = UndercoverGame.get(guildId);
  if (!game) return interaction.reply({ content: '❌ 尚未開始遊戲', ephemeral: true });

  const isHost = userId === game.host;

  switch (interaction.customId) {
    case 'undercover_join': {
      if (game.started) return interaction.reply({ content: '⏳ 遊戲已開始，無法加入！', ephemeral: true });
      if (game.players.has(userId)) return interaction.reply({ content: '✅ 你已經在遊戲中！', ephemeral: true });
      game.players.set(userId, {});
      return interaction.reply({ content: `🎉 <@${userId}> 加入遊戲！`, ephemeral: false });
    }

    case 'undercover_leave': {
      if (!game.players.has(userId)) return interaction.reply({ content: '❌ 你尚未加入遊戲', ephemeral: true });
      game.players.delete(userId);
      return interaction.reply({ content: `👋 <@${userId}> 已退出遊戲`, ephemeral: false });
    }

    case 'undercover_start': {
      if (!isHost) return interaction.reply({ content: '❌ 僅主持人可以開始遊戲！', ephemeral: true });
      if (game.started) return interaction.reply({ content: '⚠️ 遊戲已開始！', ephemeral: true });
      if (game.players.size < 3) return interaction.reply({ content: '👥 至少需要三位玩家才能開始遊戲！', ephemeral: true });

      // 分配詞語
      const playerIds = Array.from(game.players.keys());
      const undercoverIndex = Math.floor(Math.random() * playerIds.length);
      const words = game.words;

      playerIds.forEach((id, index) => {
        const word = index === undercoverIndex ? words[1] : words[0];
        game.players.set(id, { word });
        interaction.guild.members.fetch(id).then(member => {
          member.send(`🔐 你的詞語是：**${word}**。請謹慎發言找出臥底！`).catch(console.error);
        });
      });

      game.started = true;
      return interaction.reply('🎮 遊戲開始！請玩家輪流描述你的詞語！');
    }
  }
};
