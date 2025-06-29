// utils/parser.js

/**
 * 簡單示範：從文字中擷取所有 UID
 * @param {string} text
 * @returns {Array<{uid: string}>} 玩家列表
 */
function parseAllPlayers(text) {
  const regex = /UID:\s*(\d+)/g;
  const players = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    players.push({ uid: match[1] });
  }
  return players;
}

module.exports = { parseAllPlayers };
