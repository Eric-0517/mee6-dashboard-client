// 初始架構，詳情請參考投票/揭曉整合的擴充版
module.exports = {
  createGame(playerList, spyWord, citizenWord) {
    const game = {
      players: playerList,
      spy: playerList[Math.floor(Math.random() * playerList.length)],
      spyWord,
      citizenWord,
      votes: {},
      status: 'playing'
    };
    return game;
  },

  vote(game, voterId, targetId) {
    game.votes[voterId] = targetId;
  },

  getVotes(game) {
    return game.votes;
  },

  checkEnd(game) {
    const voteCounts = {};
    Object.values(game.votes).forEach(id => {
      voteCounts[id] = (voteCounts[id] || 0) + 1;
    });
    let max = 0;
    let eliminated;
    for (const id in voteCounts) {
      if (voteCounts[id] > max) {
        max = voteCounts[id];
        eliminated = id;
      }
    }

    const isSpy = eliminated === game.spy;
    return { eliminated, isSpy };
  }
};
