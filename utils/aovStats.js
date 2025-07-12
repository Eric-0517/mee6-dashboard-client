const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://aovweb.azurewebsites.net';
const headers = {
  'User-Agent': 'Mozilla/5.0',
  'Accept-Language': 'zh-TW',
};

/**
 * 抓取單場戰績詳細資料，包含10人完整資訊與舉報與對局時間
 * @param {string} matchId 對局ID
 * @returns {Promise<object|null>} 戰績詳細資料或null
 */
async function fetchMatchDetail(matchId) {
  const url = `${BASE_URL}/FightHistory/Detail?matchId=${encodeURIComponent(matchId)}`;
  try {
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);

    // 對局時間 (根據實際網頁class調整)
    const matchTime = $('.match-info .time').text().trim() || '未知時間';

    // 舉報玩家列表（假設是 ul#reportPlayersList > li）
    const reportedPlayers = [];
    $('#reportPlayersList li').each((i, el) => {
      const playerName = $(el).text().trim();
      if (playerName) reportedPlayers.push(playerName);
    });

    // 判斷勝負方（依網頁class判斷勝利隊伍）
    const blueWin = $('.blueTeam').hasClass('blue-win');
    const redWin = $('.redTeam').hasClass('red-win');

    const blueRows = $('#blueTeam tbody tr');
    const redRows = $('#redTeam tbody tr');

    const players = [];

    function parsePlayerRow(i, el, teamColor) {
      const row = $(el);
      const heroImg = row.find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;

      const name = row.find('strong').text().trim() || '未知玩家';

      // UID通常放td中帶class='uid'或特定欄位，這邊用data-uid或直接td文字擷取(需根據網頁調整)
      const uidText = row.find('td.uid').text().trim() || '';
      const uidMatch = uidText.match(/(\d+)/);
      const uid = uidMatch ? uidMatch[1] : '未知UID';

      // 伺服器與VIP資訊(例如 "(聖騎之王) | VIP 3" 可能在td.server-vip)
      let server = '';
      let vip = 'VIP 0';
      const serverVipText = row.find('td.server-vip').text().trim();
      if (serverVipText) {
        const svMatch = serverVipText.match(/\(([^)]+)\)/);
        server = svMatch ? svMatch[1] : '';
        const vipMatch = serverVipText.match(/VIP\s*(\d+)/);
        vip = vipMatch ? `VIP ${vipMatch[1]}` : 'VIP 0';
      }

      const level = row.find('td.level').text().trim() || '0';
      const kdaText = row.find('td.kda').text().trim() || '0 / 0 / 0';
      const scoreText = row.find('td.score').text().trim() || '';
      const rankText = row.find('td.rank').text().trim() || '';

      // 裝備，六個欄位可能為img帶alt或class，需依實際網頁調整
      const equips = [];
      row.find('td.equipment img').each((i, el) => {
        const alt = $(el).attr('alt') || '';
        if (alt) equips.push(`:${alt}:`);
      });

      // 輸出、承傷、經濟
      const output = row.find('td.output').text().trim() || '0 (0%)';
      const damageTaken = row.find('td.damageTaken').text().trim() || '0 (0%)';
      const economy = row.find('td.economy').text().trim() || '0 (0%)';

      // 補兵、硬控、治療量、塔傷
      const cs = row.find('td.cs').text().trim() || '0';
      const hardControl = row.find('td.hardControl').text().trim() || '0.0秒';
      const heal = row.find('td.heal').text().trim() || '0';
      const towerDamage = row.find('td.towerDamage').text().trim() || '0';

      // 勝負判斷
      const result = (teamColor === 'blue' && blueWin) || (teamColor === 'red' && redWin) ? '勝' : '負';

      players.push({
        teamColor,
        heroId,
        name,
        uid,
        server,
        vip,
        level,
        kda: kdaText,
        score: scoreText,
        rank: rankText,
        equips,
        output,
        damageTaken,
        economy,
        cs,
        hardControl,
        heal,
        towerDamage,
        result,
      });
    }

    blueRows.each((i, el) => parsePlayerRow(i, el, 'blue'));
    redRows.each((i, el) => parsePlayerRow(i, el, 'red'));

    return {
      matchId,
      matchTime,
      players,
      reportedPlayers,
    };
  } catch (err) {
    console.error('❌ fetchMatchDetail 失敗:', err.message);
    return null;
  }
}

module.exports = {
  fetchMatchDetail,
};
