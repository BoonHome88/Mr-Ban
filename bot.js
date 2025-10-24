// bot.js
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;
const PORT = process.env.PORT || 3000;

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.warn("WARNING: BOT_TOKEN or CHANNEL_ID not set in environment. Check your .env file.");
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Helper: fetch Discord user by ID using bot token
async function fetchDiscordUser(userId) {
  const url = `https://discord.com/api/v10/users/${userId}`;
  const res = await fetch(url, { headers: { Authorization: `Bot ${BOT_TOKEN}` } });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(`Discord API returned ${res.status}: ${text}`);
    err.status = res.status;
    throw err;
  }
  return await res.json();
}

// Public endpoint for frontend to get avatar/username without exposing token
app.get('/api/avatar/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const user = await fetchDiscordUser(id);
    const avatarHash = user.avatar;
    const isAnimated = avatarHash && avatarHash.startsWith('a_');
    const ext = isAnimated ? 'gif' : 'png';
    const avatarUrl = avatarHash
      ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${ext}?size=1024`
      : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;
    res.json({ username: user.username, discriminator: user.discriminator, avatar: avatarUrl });
  } catch (err) {
    res.status(err.status || 500).json({ error: 'Cannot fetch user', details: err.message });
  }
});

// API to receive ban payload from frontend and post embed to configured channel
app.post('/api/ban', async (req, res) => {
  const { name, discord, steamhex, reason, fine, admin, banType } = req.body;
  if (!name || !discord || !steamhex || !reason || !admin || !banType) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // color map (same as frontend)
  const colorMap = {
    "ถาวร": { emoji: "🔴", hex: 0xff0000, color: "red" },
    "ใบแดง": { emoji: "🔴", hex: 0xff0000, color: "red" },
    "ใบส้ม": { emoji: "🟠", hex: 0xffa500, color: "orange" },
    "ใบเหลือง": { emoji: "🟡", hex: 0xffff00, color: "yellow" },
    "ปรับ": { emoji: "💸", hex: 0x00ff00, color: "green" },
  };

  try {
    // fetch discord user info (avatar etc)
    let avatarUrl = `https://cdn.discordapp.com/embed/avatars/${discord % 5}.png`;
    try {
      const user = await fetchDiscordUser(discord);
      const avatarHash = user.avatar;
      const isAnimated = avatarHash && avatarHash.startsWith('a_');
      const ext = isAnimated ? 'gif' : 'png';
      avatarUrl = avatarHash
        ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.${ext}?size=1024`
        : avatarUrl;
    } catch (errUser) {
      // keep default avatarUrl
      console.warn('Could not fetch user from Discord API:', errUser.message);
    }

    const payload = {
      content: `<@${discord}>`,
      embeds: [
        {
          title: "📢 ประกาศแบน",
          color: colorMap[banType] ? colorMap[banType].hex : 0x808080,
          thumbnail: { url: avatarUrl },
          fields: [
            { name: "ข้อมูลผู้ถูกแบน", value: `ประเภท: ${banType}\nชื่อในเกม: ${name}\nDiscord: <@${discord}>`, inline: false },
            { name: "Steam Hex", value: steamhex, inline: true },
            { name: "เหตุผล", value: reason, inline: false },
            { name: "ค่าปรับ", value: fine || "0 IC", inline: true },
            { name: "แอดมินผู้รับเรื่อง", value: admin, inline: true },
          ],
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const postRes = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!postRes.ok) {
      const body = await postRes.text();
      return res.status(postRes.status).json({ error: 'Discord API error', details: body });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Error in /api/ban:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Serving static files from /public`);
});
