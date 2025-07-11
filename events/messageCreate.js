const { parseAllPlayers } = require('../utils/parser');
const { saveParsedRecords } = require('../utils/updateRecords');
const gameManager = require('../game/gameManager');

module.exports = {
  name: 'messageCreate',
  /**
   * @param {import('discord.js').Message} message
   * @param {import('discord.js').Client} client
   */
  async execute(message, client) {
    // 忽略機器人訊息和非伺服器訊息（私訊等）
    if (message.author.bot || !message.guild) return;

    try {
      // 1. 讓 gameManager 先處理遊戲類輸入（例如猜歌、誰是臥底等）
      const handled = await gameManager.handleInput(message);
      if (handled) return; // 若遊戲模組已處理，則不繼續後續

      // 2. 處理指定玩家（ID=976020841634603009）發送的含 UID 訊息，自動解析並存資料
      if (message.author.id === '976020841634603009' && message.content.includes('UID:')) {
        const players = parseAllPlayers(message.content); // 解析玩家清單
        await saveParsedRecords(players); // 存入資料庫或更新
        console.log(`✅ 已自動擷取並更新 ${players.length} 筆玩家戰績`);
      }

      // 3. 其他文字觸發行為可自行擴充
      // 例如：
      // if (message.content === '!ping') {
      //   await message.reply('pong');
      // }

    } catch (err) {
      console.error(`❌ [messageCreate] 錯誤：`, err);
    }
  }
};
