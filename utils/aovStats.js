const axios = require('axios');
const cheerio = require('cheerio');

const BASE_URL = 'https://aovweb.azurewebsites.net';
const headers = {
  'User-Agent': 'Mozilla/5.0',
};

async function fetchMatchHistoryList(playerName) {
  try {
    const url = `${BASE_URL}/FightHistory/View?playerName=${encodeURIComponent(playerName)}`;
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const matchList = [];
    $('.match-entry').each((i, el) => {
      const id = $(el).find('.match-id').text().trim();
      const heroImg = $(el).find('img').attr('src') || '';
      const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
      const heroId = heroIdMatch ? heroIdMatch[1] : null;
      if (id) matchList.push({ id, heroId });
    });

    return matchList;
  } catch (err) {
    console.error('❌ 抓取歷史列表失敗:', err.message);
    return [];
  }
}

async function fetchMatchDetail(matchId) {
  try {
    const url = `${BASE_URL}/FightHistory/Detail?matchId=${encodeURIComponent(matchId)}`;
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data);

    const teammates = [];
    const opponents = [];

    $('#blueTeam tbody tr').each((i, el) => {
      const name = $(el).find('strong').text().trim();
      const kda = $(el).find('td').eq(2).text().trim();
      teammates.push(`${name} (${kda})`);
    });

    $('#redTeam tbody tr').each((i, el) => {
      const name = $(el).find('strong').text().trim();
      const kda = $(el).find('td').eq(2).text().trim();
      opponents.push(`${name} (${kda})`);
    });

    const stats = {};
    $('td').each((_, td) => {
      const text = $(td).text().trim();
      const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
      for (const line of lines) {
        if (line.includes('排位分') || line.includes('信譽分') || line.includes('分路')) {
          const [key, val] = line.split('：');
          if (key && val) stats[key] = val;
        }
      }
    });

    const heroImg = $('#blueTeam tbody tr').first().find('img').attr('src') || '';
    const heroIdMatch = heroImg.match(/HeroHeadPath\/(\d+)head\.jpg/);
    const heroId = heroIdMatch ? heroIdMatch[1] : null;

    const rank = $('td').filter((_, el) => $(el).text().includes('(')).first().text().trim();

    return {
      id: matchId,
      heroId,
      teammates,
      opponents,
      stats,
      rank,
    };
  } catch (err) {
    console.error('❌ 抓取詳細失敗:', err.message);
    return null;
  }
}

module.exports = {
  fetchMatchHistoryList,
  fetchMatchDetail,
};
