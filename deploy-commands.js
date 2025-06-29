const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

// 載入環境變數
const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error("❌ 請確認 .env 檔案中有正確設置 DISCORD_TOKEN 與 CLIENT_ID");
  process.exit(1);
}

// 讀取 commands 資料夾
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
if (!fs.existsSync(commandsPath)) {
  console.error(`❌ 找不到指令資料夾：${commandsPath}`);
  process.exit(1);
}

// 讀取所有 .js 指令檔案
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (command?.data && typeof command.data.name === 'string') {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ 指令 ${file} 格式不正確，已跳過`);
  }
}

// 設定 REST 用戶端
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// 推送指令
(async () => {
  try {
    console.log(`🔁 準備推送 ${commands.length} 個指令...`);
    console.log("📋 指令清單:", commands.map(c => c.name).join(', '));

    // 1. 推送到全域（所有伺服器，5～60 分鐘才會生效）
    const globalRes = await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );
    console.log(`✅ 全域指令已註冊，共 ${globalRes.length} 個`);

    // 2. 如果 GUILD_ID 有設定，同步推送到測試伺服器（秒顯）
    if (GUILD_ID) {
      const guildRes = await rest.put(
        Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
        { body: commands },
      );
      console.log(`✅ 測試伺服器（${GUILD_ID}）指令註冊成功，共 ${guildRes.length} 個`);
    } else {
      console.warn("⚠️ 尚未設定 GUILD_ID，無法即時測試指令");
    }

  } catch (err) {
    console.error("❌ 指令推送失敗：", err);
  }
})();
