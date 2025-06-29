/**
 * 模擬存入玩家紀錄（可替換成DB寫入）
 * @param {Array<{uid: string}>} players 
 */
async function saveParsedRecords(players) {
  console.log('模擬存入資料庫的玩家列表:', players);
  // 模擬延遲，真實環境改成寫入資料庫的程式碼
  await new Promise(resolve => setTimeout(resolve, 500));
}

module.exports = { saveParsedRecords };
