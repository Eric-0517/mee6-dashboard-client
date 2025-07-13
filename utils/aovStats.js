const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://aovweb.azurewebsites.net';
const headers = {
  'User-Agent': 'Mozilla/5.0',
  'Accept-Language': 'zh-TW',
};

/**
 * 抓取玩家名稱查詢的歷史戰績列表
 * @param {string} playerName 玩家名稱
 * @returns {Promise<Array<{id:string,heroId:string|null}>>}
 */
async function fetchMatchHistoryListByName(playerName) {
  try {
    const url = `${BASE_URL}/FightHistory/View?searchType=playerName&keyword=${encodeURIComponent(playerName)}`;
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const matchList = [];

    $('.match-entry').each((_, el) => {
      const id = $(el).find('.match-id').text().trim();
      const heroImg = $(el).find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;

      if (id) matchList.push({ id, heroId });
    });

    return matchList;
  } catch (err) {
    console.error('❌ fetchMatchHistoryListByName 失敗:', err.message);
    return [];
  }
}

/**
 * 抓取 UID + 伺服器ID 查詢的歷史戰績列表
 * @param {string} uid 玩家 UID
 * @param {string|number} serverId 伺服器 ID（如 1011、1012）
 * @returns {Promise<Array<{id:string,heroId:string|null}>>}
 */
async function fetchMatchHistoryListByUID(uid, serverId) {
  try {
    const url = `${BASE_URL}/FightHistory/View?searchType=UID&keyword=${encodeURIComponent(uid)}&dwLogicWorldId=${serverId}`;
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const matchList = [];

    $('.match-entry').each((_, el) => {
      const id = $(el).find('.match-id').text().trim();
      const heroImg = $(el).find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;

      if (id) matchList.push({ id, heroId });
    });

    return matchList;
  } catch (err) {
    console.error('❌ fetchMatchHistoryListByUID 失敗:', err.message);
    return [];
  }
}

/**
 * 抓取單場戰績詳細資料，包含10人完整資訊與舉報與對局時間
 * @param {string} matchId 對局 ID
 * @returns {Promise<object|null>}
 */
async function fetchMatchDetail(matchId) {
  const url = `${BASE_URL}/FightHistory/Detail?matchId=${encodeURIComponent(matchId)}`;
  try {
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);

    const matchTime = $('.match-info .time').text().trim() || '未知時間';
    const reportedPlayers = [];
    $('#reportPlayersList li').each((_, el) => {
      const name = $(el).text().trim();
      if (name) reportedPlayers.push(name);
    });

    const blueWin = $('.blueTeam').hasClass('blue-win');
    const redWin = $('.redTeam').hasClass('red-win');

    const blueRows = $('#blueTeam tbody tr');
    const redRows = $('#redTeam tbody tr');

    const players = [];

    function parsePlayerRow(_, el, teamColor) {
      const row = $(el);
      const heroImg = row.find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;

      const name = row.find('strong').text().trim() || '未知玩家';
      const uidText = row.find('td.uid').text().trim();
      const uidMatch = uidText.match(/\d+/);
      const uid = uidMatch ? uidMatch[0] : '未知UID';

      let server = '', vip = 'VIP 0';
      const svText = row.find('td.server-vip').text().trim();
      if (svText) {
        const sMatch = svText.match(/\(([^)]+)\)/);
        server = sMatch ? sMatch[1] : '';
        const vMatch = svText.match(/VIP\s*(\d+)/);
        vip = vMatch ? `VIP ${vMatch[1]}` : 'VIP 0';
      }

      const level = row.find('td.level').text().trim() || '0';
      const kda = row.find('td.kda').text().trim() || '0/0/0';
      const score = row.find('td.score').text().trim() || '';
      const rank = row.find('td.rank').text().trim() || '';

      const equips = [];
      row.find('td.equipment img').each((_, el) => {
        const alt = $(el).attr('alt');
        if (alt) equips.push(`:${alt}:`);
      });

      const output = row.find('td.output').text().trim() || '0 (0%)';
      const damageTaken = row.find('td.damageTaken').text().trim() || '0 (0%)';
      const economy = row.find('td.economy').text().trim() || '0';

      const cs = row.find('td.cs').text().trim() || '0';
      const hardControl = row.find('td.hardControl').text().trim() || '0.0秒';
      const heal = row.find('td.heal').text().trim() || '0';
      const towerDamage = row.find('td.towerDamage').text().trim() || '0';

      const result = (teamColor === 'blue' && blueWin) || (teamColor === 'red' && redWin) ? '勝' : '負';

      players.push({
        teamColor,
        heroId,
        name,
        uid,
        server,
        vip,
        level,
        kda,
        score,
        rank,
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
  fetchMatchHistoryListByName,
  fetchMatchHistoryListByUID,
  fetchMatchDetail,
};
