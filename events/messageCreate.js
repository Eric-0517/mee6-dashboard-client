const { parseAllPlayers } = require('../utils/parser');
const { saveParsedRecords } = require('../utils/updateRecords');
const gameManager = require('../game/gameManager');

module.exports = {
  name: 'messageCreate',
  /**
   * 
   * @param {import('discord.js').Message} message 
   * @param {import('discord.js').Client} client 
   */
  async execute(message, client) {
    // 忽略機器人自己發送的訊息或非伺服器訊息
    if (message.author.bot || !message.guild) return;

    try {
      // 1. 先讓 gameManager 處理遊戲輸入（猜歌、臥底詞語等）
      const handled = await gameManager.handleInput(message);
      if (handled) return; // 若是遊戲輸入，停止後續處理

      // 2. 接著處理特定玩家發送含 UID 的訊息，解析並存資料
      if (message.author.id === '976020841634603009' && message.content.includes('UID:')) {
        const players = parseAllPlayers(message.content);
        await saveParsedRecords(players);
        console.log(`✅ 已自動擷取並更新 ${players.length} 筆玩家戰績`);
      }

      // 3. 你也可以在這裡新增其他文字觸發行為
      // 例如：
      // if (message.content === '!ping') {
      //   await message.reply('pong');
      // }

    } catch (err) {
      console.error(`❌ [messageCreate] 錯誤：`, err);
    }
  }
};
