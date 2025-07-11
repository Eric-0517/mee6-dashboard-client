const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://aovweb.azurewebsites.net';
const headers = {
  'User-Agent': 'Mozilla/5.0',
  'Accept-Language': 'zh-TW',
};

// ✅ 取得歷史戰績列表（透過 UID + serverId）
async function fetchMatchHistoryListByUID(uid, serverId) {
  const url = `${BASE_URL}/FightHistory/View?searchType=UID&keyword=${uid}&dwLogicWorldId=${serverId}`;
  try {
    const res = await axios.get(url, { headers });
    const $ = cheerio.load(res.data);
    const matchList = [];

    $('.match-entry').each((i, el) => {
      const id = $(el).find('.match-id').text().trim();

      const heroImg = $(el).find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;

      const kdaText = $(el).find('.match-kda').text().trim(); // e.g. "8 / 2 / 5"
      const result = $(el).find('.match-result').text().trim(); // 勝利/失敗
      const heroName = $(el).find('.match-hero').text().trim(); // 英雄名稱
      const mode = $(el).find('.match-mode').text().trim();
      const time = $(el).find('.match-time').text().trim();

      if (id) {
        matchList.push({
          id,
          heroId,
          heroName,
          result,
          kda: kdaText,
          mode,
          time,
        });
      }
    });

    return matchList;
  } catch (err) {
    console.error('❌ fetchMatchHistoryListByUID 失敗:', err.message);
    return [];
  }
}

// ✅ 抓取單場戰績詳細資料
async function fetchMatchDetail(matchId) {
  const url = `${BASE_URL}/FightHistory/Detail?matchId=${encodeURIComponent(matchId)}`;
  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const teammates = [];
    const opponents = [];

    $('#blueTeam tbody tr').each((i, elem) => {
      const name = $(elem).find('strong').text().trim();
      const kda = $(elem).find('td').eq(2).text().trim();
      teammates.push(`${name} (${kda})`);
    });

    $('#redTeam tbody tr').each((i, elem) => {
      const name = $(elem).find('strong').text().trim();
      const kda = $(elem).find('td').eq(2).text().trim();
      opponents.push(`${name} (${kda})`);
    });

    const stats = {};
    $('td').each((i, el) => {
      const text = $(el).text().trim();
      if (
        text.includes('排位分') ||
        text.includes('信譽分') ||
        text.includes('系統判定')
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

    const rank = $('td')
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
      rank,
    };
  } catch (err) {
    console.error('❌ fetchMatchDetail 失敗:', err.message);
    return null;
  }
}

module.exports = {
  fetchMatchHistoryListByUID,
  fetchMatchDetail,
};
