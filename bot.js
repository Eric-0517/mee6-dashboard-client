require('dotenv').config();
const express = require('express');
const {
  Client, GatewayIntentBits, Partials, Events,
  REST, Routes
} = require('discord.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// === Express 保活伺服器 ===
const app = express();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => res.send('<h1>Bot is alive!</h1>'));
app.listen(PORT, () => console.log(`✅ 保活伺服器啟動於 http://localhost:${PORT}`));

// === MongoDB 連線 ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB 連線成功');
}).catch(console.error);

// === Discord Client 初始化 ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction]
});

// === 載入指令 ===
client.commands = new Map();
const commands = [];
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(path.join(commandsPath, file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[警告] 指令檔 ${file} 缺少 data 或 execute`);
    }
  }
}

// === 註冊 Slash 指令 ===
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.TEST_GUILD_ID;

  try {
    if (guildId) {
      await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
      console.log('✅ 測試伺服器 Slash 指令註冊成功');
    }
    await rest.put(Routes.applicationCommands(clientId), { body: commands });
    console.log('✅ 全域 Slash 指令註冊成功（生效約需 1 小時）');
  } catch (error) {
    console.error('❌ 註冊指令錯誤:', error);
  }
}

// === Bot Ready 事件 ===
client.once(Events.ClientReady, async () => {
  console.log(`🤖 ${client.user.tag} 已上線！`);
  await registerCommands();
});

// === 處理互動事件（Modal + Slash）===
client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isModalSubmit()) {
      if (interaction.customId.startsWith('guessNumberModal_')) {
        const answer = parseInt(interaction.customId.split('_')[1], 10);
        const guess = parseInt(interaction.fields.getTextInputValue('guessInput'), 10);
        if (isNaN(guess) || guess < 1 || guess > 100) {
          if (!interaction.replied) {
            return await interaction.reply({ content: '⚠️ 請輸入 1~100 的數字！', ephemeral: true });
          }
        }
        if (!interaction.replied) {
          if (guess === answer) {
            return await interaction.reply(`🎉 恭喜你猜中了！答案就是 ${answer}`);
          } else if (guess < answer) {
            return await interaction.reply(`🔺 ${guess} 太小了，再試一次！`);
          } else {
            return await interaction.reply(`🔻 ${guess} 太大了，再試一次！`);
          }
        }
      }
      return;
    }

    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      await command.execute(interaction); // 👈 不再預先 deferReply，交給每個指令自己決定
    }
  } catch (err) {
    console.error('❌ 指令或互動錯誤：', err);
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: '❌ 執行指令時發生錯誤，請稍後再試！', ephemeral: true });
      } else {
        await interaction.editReply('❌ 執行指令時發生錯誤，請稍後再試！');
      }
    } catch (e) {
      console.error('⚠️ 回覆錯誤時也出錯:', e);
    }
  }
});

// === 全域錯誤捕捉 ===
process.on('uncaughtException', err => {
  console.error('🔥 未捕捉例外錯誤:', err);
});

// === 登入 Bot ===
client.login(process.env.DISCORD_TOKEN);

// === 自我 Ping 保活機制 ===
const fetch = require('node-fetch');
setInterval(() => {
  fetch(`http://localhost:${PORT}`).catch(err => {
    console.log('⚠️ 自我 Ping 失敗：', err.message);
  });
}, 1000 * 60 * 5); // 每 5 分鐘 ping 一次
