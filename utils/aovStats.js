const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://aovweb.azurewebsites.net';

const headers = {
  'User-Agent': 'Mozilla/5.0',
  'Accept-Language': 'zh-TW',
};

// ✅ 透過 UID + 伺服器 ID 取得歷史戰績列表
async function fetchMatchHistoryListByUID(uid, serverId) {
  const url = `${BASE_URL}/FightHistory/View?searchType=UID&keyword=${uid}&dwLogicWorldId=${serverId}`;
  try {
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const matchList = [];

    $('.match-entry').each((_, el) => {
      const id = $(el).find('.match-id').text().trim();
      const heroName = $(el).find('.hero-name').text().trim() || '未知英雄';
      const mode = $(el).find('.game-mode').text().trim() || '未知模式';
      const time = $(el).find('.match-time').text().trim() || '未知時間';
      const result = $(el).find('.match-result').text().trim() || '未知結果';
      const kda = $(el).find('.kda').text().trim() || '0/0/0';
      const heroImg = $(el).find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;

      if (id) {
        matchList.push({
          id,
          heroId,
          heroName,
          mode,
          time,
          result,
          kda,
        });
      }
    });

    return matchList;
  } catch (err) {
    console.error('❌ fetchMatchHistoryListByUID 失敗:', err.message);
    return [];
  }
}

// ✅ 透過玩家名稱查詢歷史戰績列表（類似 fetchMatchHistoryListByUID，但改用玩家名稱搜尋）
async function fetchMatchHistoryListByName(playerName) {
  const url = `${BASE_URL}/FightHistory/View?searchType=playerName&keyword=${encodeURIComponent(playerName)}`;
  try {
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const matchList = [];

    $('.match-entry').each((_, el) => {
      const id = $(el).find('.match-id').text().trim();
      const heroName = $(el).find('.hero-name').text().trim() || '未知英雄';
      const mode = $(el).find('.game-mode').text().trim() || '未知模式';
      const time = $(el).find('.match-time').text().trim() || '未知時間';
      const result = $(el).find('.match-result').text().trim() || '未知結果';
      const kda = $(el).find('.kda').text().trim() || '0/0/0';
      const heroImg = $(el).find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;

      if (id) {
        matchList.push({
          id,
          heroId,
          heroName,
          mode,
          time,
          result,
          kda,
        });
      }
    });

    return matchList;
  } catch (err) {
    console.error('❌ fetchMatchHistoryListByName 失敗:', err.message);
    return [];
  }
}

// ✅ 抓取單場戰績詳細資料
async function fetchMatchDetail(matchId) {
  const url = `${BASE_URL}/FightHistory/Detail?matchId=${encodeURIComponent(matchId)}`;
  try {
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);

    const teammates = [];
    const opponents = [];

    $('#blueTeam tbody tr').each((_, elem) => {
      const name = $(elem).find('strong').text().trim();
      const kda = $(elem).find('td').eq(2).text().trim();
      teammates.push(`${name} (${kda})`);
    });

    $('#redTeam tbody tr').each((_, elem) => {
      const name = $(elem).find('strong').text().trim();
      const kda = $(elem).find('td').eq(2).text().trim();
      opponents.push(`${name} (${kda})`);
    });

    // 解析 B50 測試欄位（排位分、信譽分、系統判定等）
    const stats = {};
    $('td').each((_, el) => {
      const text = $(el).text().trim();
      if (
        text.includes('排位分') ||
        text.includes('信譽分') ||
        text.includes('系統判定') ||
        text.includes('分路')
      ) {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        for (const line of lines) {
          const [key, value] = line.split('：');
          if (key && value) stats[key] = value;
        }
      }
    });

    const heroImg = $('#blueTeam tbody tr').first().find('img').attr('src') || '';
    const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
    const heroId = heroIdMatch ? heroIdMatch[1] : null;

    const rankText = $('td')
      .filter((_, el) => $(el).text().includes('('))
      .first()
      .text()
      .trim();

    return {
      id: matchId,
      heroId,
      teammates,
      opponents,
      stats,
      rank: rankText,
    };
  } catch (err) {
    console.error('❌ fetchMatchDetail 失敗:', err.message);
    return null;
  }
}

module.exports = {
  fetchMatchHistoryListByUID,
  fetchMatchHistoryListByName,
  fetchMatchDetail,
};
