require('dotenv').config(); // 讀取 .env 檔案

const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');

// 建立 Discord client 並設定 intents
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// 建立指令集合
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands'); // 指令資料夾
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// 載入每個指令模組
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
}

// 監聽斜線指令互動事件
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '⚠️ 執行指令時出錯！', ephemeral: true });
  }
});

// 機器人啟動後提示
client.once('ready', () => {
  console.log(`🤖 機器人已上線：${client.user.tag}`);
});

// 登入機器人
client.login(process.env.DISCORD_TOKEN);
