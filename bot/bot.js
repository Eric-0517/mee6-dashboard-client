require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const mongoose = require('mongoose');

// 建立 Discord Client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// XP 資料結構（MongoDB）
const userSchema = new mongoose.Schema({
  userId: String,
  guildId: String,
  xp: Number,
  level: Number
});
const User = mongoose.model('User', userSchema);

// 當機器人上線
client.once('ready', () => {
  console.log(`✅ Bot 已登入：${client.user.tag}`);
});

// XP 計算函式
function calculateLevel(xp) {
  return Math.floor(0.1 * Math.sqrt(xp));
}

// 每次收到訊息時
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // 自動加 XP
  const userId = message.author.id;
  const guildId = message.guild.id;

  let user = await User.findOne({ userId, guildId });
  if (!user) {
    user = new User({ userId, guildId, xp: 0, level: 0 });
  }

  user.xp += 10; // 每則訊息加 10XP
  const newLevel = calculateLevel(user.xp);
  if (newLevel > user.level) {
    user.level = newLevel;
    message.reply(`🎉 恭喜升級！目前等級：${user.level}`);
  }

  await user.save();

  // 指令處理
  const args = message.content.trim().split(/ +/);
  const command = args[0].toLowerCase();

  if (command === '!ping') {
    message.reply('🏓 Pong!');
  }

  if (command === '!level') {
    message.reply(`🧬 你目前的等級是 ${user.level}，XP：${user.xp}`);
  }

  if (command === '!rank') {
    const topUsers = await User.find({ guildId })
      .sort({ xp: -1 })
      .limit(5);

    const rankMsg = topUsers
      .map((u, i) => `#${i + 1} <@${u.userId}> - 等級 ${u.level} (${u.xp} XP)`)
      .join('\n');

    message.channel.send(`🏆 排行榜前五：\n${rankMsg}`);
  }

  if (command === '!help') {
    message.reply(
      `📖 可用指令：
- !ping
- !level
- !rank
- !help`
    );
  }
});

// 登入 Discord 並連接 MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ 已連接 MongoDB');
    client.login(process.env.DISCORD_TOKEN);
  })
  .catch((err) => {
    console.error('❌ MongoDB 連接失敗：', err);
  });
