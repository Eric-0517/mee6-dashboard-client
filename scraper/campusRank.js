// scraper/campusRank.js
const puppeteer = require('puppeteer');

async function scrapeCampusRank() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  try {
    await page.goto('https://campus.moba.garena.tw/rank', { waitUntil: 'networkidle2', timeout: 60000 });

    // 等待榜單載入完成
    await page.waitForSelector('.rank-table tbody tr');

    const data = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('.rank-table tbody tr'));
      return rows.slice(0, 100).map(row => {
        const cols = row.querySelectorAll('td');
        return {
          rank: parseInt(cols[0]?.innerText.trim(), 10),
          playerName: cols[1]?.innerText.trim(),
          score: parseInt(cols[2]?.innerText.trim().replace(',', ''), 10),
          rankTier: cols[3]?.innerText.trim(),
          school: cols[4]?.innerText.trim(),
        };
      });
    });

    await browser.close();
    return data;
  } catch (err) {
    console.error('❌ 擷取校園排行榜失敗：', err);
    await browser.close();
    return [];
  }
}

module.exports = scrapeCampusRank;
