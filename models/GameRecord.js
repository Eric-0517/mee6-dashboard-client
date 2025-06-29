// models/GameRecord.js

const mongoose = require('mongoose');

const gameRecordSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  playerName: { type: String },
  wins: { type: Number, default: 0 },
  losses: { type: Number, default: 0 },
  kills: { type: Number, default: 0 },
  deaths: { type: Number, default: 0 },
  lastUpdated: { type: Date, default: Date.now },
});

const GameRecord = mongoose.model('GameRecord', gameRecordSchema);

module.exports = GameRecord;
