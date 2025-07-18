const axios = require('axios');

const api = axios.create({
  baseURL: 'https://iqia6two1k.execute-api.ap-southeast-1.amazonaws.com/prod',
  headers: { 'Content-Type': 'application/json' },
});

// ✅ 1. 透過名稱取得玩家基本資料
exports.getPlayerProfileByName = async (name) => {
  try {
    const res = await api.post('/api/player/profile', { playerName: name });
    return res.data?.data;
  } catch (err) {
    console.error('取得玩家資料錯誤 (名稱):', err);
    return null;
  }
};

// ✅ 2. 透過 UID + 伺服器取得玩家基本資料
exports.getPlayerProfileByUID = async (uid, serverId = 1011) => {
  try {
    const res = await api.post('/api/player/profile', {
      uid: uid.toString(),
      server: serverId
    });
    return res.data?.data;
  } catch (err) {
    console.error('取得玩家資料錯誤 (UID):', err);
    return null;
  }
};

// ✅ 3. 查詢最近對局（透過玩家名稱）
exports.getLatestMatchByName = async (name) => {
  try {
    const profile = await exports.getPlayerProfileByName(name);
    if (!profile?.uid || !profile?.server) return null;

    const res = await api.post('/api/player/matchlist', {
      uid: profile.uid.toString(),
      server: profile.server,
      page: 1,
      pageSize: 1
    });

    return {
      profile,
      match: res.data?.data?.matches?.[0] || null
    };
  } catch (err) {
    console.error('查詢對局錯誤 (名稱):', err);
    return null;
  }
};

// ✅ 4. 查詢最近對局（透過 UID 與伺服器）
exports.getLatestMatchByUID = async (uid, serverId = 1011) => {
  try {
    const profile = await exports.getPlayerProfileByUID(uid, serverId);
    if (!profile?.uid) return null;

    const res = await api.post('/api/player/matchlist', {
      uid: uid.toString(),
      server: serverId,
      page: 1,
      pageSize: 1
    });

    return {
      profile,
      match: res.data?.data?.matches?.[0] || null
    };
  } catch (err) {
    console.error('查詢對局錯誤 (UID):', err);
    return null;
  }
};

// ✅ 5. 查詢排行榜（最多 20000 名）
exports.getLeaderboard = async (serverId = 1011) => {
  try {
    const res = await api.post('/api/rank/leaderboard', {
      server: serverId,
      page: 1,
      pageSize: 20000
    });
    return res.data?.data?.list || [];
  } catch (err) {
    console.error('取得排行榜錯誤:', err);
    return [];
  }
};
