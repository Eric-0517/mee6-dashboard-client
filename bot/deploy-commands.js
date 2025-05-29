const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config(); // 如果你用 .env 來管理 token

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  commands.push(command.data.toJSON());
}

// 替換為你自己的資料
const clientId = '1376593859626143765';
const guildId = '1274722307167879288';
const token = 'MTM3NjU5Mzg1OTYyNjE0Mzc2NQ.GfVwNp.JTB6OH1cYeqCIXDILhiWF8dvipThU4JodUBIBc';

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('🔁 正在重新整理應用程式指令...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands },
    );
    console.log('✅ 指令上傳完成！');
  } catch (error) {
    console.error(error);
  }
})();
