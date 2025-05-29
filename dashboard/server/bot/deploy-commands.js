const fs = require('node:fs');
const path = require('node:path');
const { REST, Routes } = require('discord.js');
require('dotenv').config();

// 驗證環境變數
const { DISCORD_TOKEN, CLIENT_ID } = process.env;

if (!DISCORD_TOKEN || !CLIENT_ID) {
  console.error("❌ 請確認 .env 檔案中有正確設置 DISCORD_TOKEN 與 CLIENT_ID");
  process.exit(1);
}

// 讀取指令資料夾
const commands = [];
const commandsPath = path.join(__dirname, 'commands');

if (!fs.existsSync(commandsPath)) {
  console.error(`❌ 找不到指令資料夾：${commandsPath}`);
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// 載入每個指令的 JSON
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if (command?.data) {
    commands.push(command.data.toJSON());
  } else {
    console.warn(`⚠️ 指令 ${file} 格式無效，跳過`);
  }
}

// 設定 REST 客戶端
const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

// 註冊指令
(async () => {
  try {
    console.log('🔁 正在重新整理應用程式指令...');

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands },
    );

    console.log('✅ 指令上傳完成！');
  } catch (error) {
    console.error('❌ 上傳指令失敗：', error);
  }
})();
