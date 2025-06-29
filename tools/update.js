// update.js
require('dotenv').config();
const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

const TOKEN = process.env.TOKEN; // 你可以改成直接放字串
const UPDATE_MESSAGE = `📢 **新版本更新通知！**

🛠️ 更新內容：
- 新增心理測驗互動系統
- 修復指令導致 Bot 當機的問題
- 加入按鈕超時保護

👉 點擊下方按鈕進行功能更新或查看最新內容！`;

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
  partials: [Partials.Channel],
});

client.once('ready', async () => {
  console.log(`✅ 機器人上線：${client.user.tag}`);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('confirm_update')
      .setLabel('🆕 立即更新')
      .setStyle(ButtonStyle.Success)
  );

  const guilds = client.guilds.cache;

  for (const [guildId, guild] of guilds) {
    try {
      await guild.fetch(); // 確保資料更新
      const channels = guild.channels.cache;

      let targetChannel = null;

      // 1. 優先找 systemChannel
      if (guild.systemChannel && guild.systemChannel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)) {
        targetChannel = guild.systemChannel;
      } else {
        // 2. 找第一個有發訊權限的文字頻道
        targetChannel = channels.find(channel =>
          channel.isTextBased() &&
          channel.permissionsFor(guild.members.me).has(PermissionsBitField.Flags.SendMessages)
        );
      }

      if (targetChannel) {
        await targetChannel.send({
          content: UPDATE_MESSAGE,
          components: [row],
        });
        console.log(`✅ 發送更新到 ${guild.name} (${targetChannel.name})`);
      } else {
        console.warn(`⚠️ 找不到可發送頻道：${guild.name}`);
      }
    } catch (err) {
      console.error(`❌ 發送到 ${guildId} 失敗:`, err);
    }
  }

  setTimeout(() => {
    console.log('✅ 全伺服器更新完成，關閉 Bot');
    client.destroy();
  }, 5000);
});

client.login(TOKEN);
