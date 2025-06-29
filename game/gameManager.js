// 小遊戲統一管理器
const guessSong = require('./guessSong');
const typingRace = require('./typingRace');
const idiomFill = require('./成語填空.js');
const spyGame = require('./誰是臥底.js');

const activeGames = new Map();

module.exports = {
  startGame(gameType, interaction, options = {}) {
    const channelId = interaction.channel.id;
    if (activeGames.has(channelId)) {
      return interaction.reply({ content: '⚠️ 這個頻道已有進行中的遊戲！', ephemeral: true });
    }

    let gameInstance;
    switch (gameType) {
      case 'guessSong':
        gameInstance = guessSong(interaction, options);
        break;
      case 'typingRace':
        gameInstance = typingRace(interaction);
        break;
      case 'idiomFill':
        gameInstance = idiomFill(interaction);
        break;
      case 'spyGame':
        gameInstance = spyGame(interaction, options);
        break;
      default:
        return interaction.reply({ content: '❌ 無效的遊戲類型。', ephemeral: true });
    }

    activeGames.set(channelId, { type: gameType, instance: gameInstance });

    // 結束後移除
    gameInstance.onEnd = () => {
      activeGames.delete(channelId);
    };
  },

  endGame(channelId) {
    if (activeGames.has(channelId)) {
      const { instance } = activeGames.get(channelId);
      if (instance.endGame) instance.endGame();
      activeGames.delete(channelId);
    }
  },

  getGame(channelId) {
    return activeGames.get(channelId);
  }
};
