// test-scrape.js
const scrapeCampusRank = require('./scraper/campusRank');

(async () => {
  const result = await scrapeCampusRank();
  console.log(result.slice(0, 5)); // 顯示前 5 筆
})();
