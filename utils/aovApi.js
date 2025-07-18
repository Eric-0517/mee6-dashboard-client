const axios = require('axios');

const api = axios.create({
  baseURL: 'https://iqia6two1k.execute-api.ap-southeast-1.amazonaws.com/prod',
  headers: {
    'Content-Type': 'application/json',
  },
});

exports.getPlayerProfileByName = async (name) => {
  try {
    const res = await api.post('/api/player/profile', { playerName: name });
    return res.data?.data || null;
  } catch (err) {
    console.error('❌ getPlayerProfileByName error:', err?.response?.data || err.message);
    return null;
  }
};

exports.getMatchListByUID = async (uid, serverId = 1011, page = 1, pageSize = 1) => {
  try {
    const res = await api.post('/api/player/matchlist', {
      uid: uid.toString(),
      server: serverId,
      page,
      pageSize,
    });
    return res.data?.data?.matches || [];
  } catch (err) {
    console.error('❌ getMatchListByUID error:', err?.response?.data || err.message);
    return [];
  }
};
