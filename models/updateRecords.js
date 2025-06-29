const GameRecord = require('../models/GameRecord');

async function saveParsedRecords(records) {
  for (const r of records) {
    await GameRecord.updateOne(
      { uid: r.uid },
      {
        $set: { player_name: r.player_name },
        $push: { records: r }
      },
      { upsert: true }
    );
  }
}
module.exports = { saveParsedRecords };
