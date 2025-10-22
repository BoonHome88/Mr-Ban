import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

// 🔧 ใส่ TOKEN ของ Discord Bot ที่อยู่ในเซิร์ฟเวอร์เดียวกับผู้เล่น
const DISCORD_BOT_TOKEN = "YOUR_DISCORD_BOT_TOKEN_HERE";

app.get("/:discordId", async (req, res) => {
    const { discordId } = req.params;

    try {
        // ดึงข้อมูลผู้ใช้จาก Discord API
        const response = await fetch(`https://discord.com/api/v10/users/${discordId}`, {
            headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
        });

        if (!response.ok) {
            // ถ้าไม่พบ user หรือ bot ไม่มีสิทธิ์ → ส่ง default avatar กลับ
            const defaultAvatar = `https://cdn.discordapp.com/embed/avatars/${discordId % 5}.png`;
            return res.json({ avatar: defaultAvatar, error: "User not accessible or not found" });
        }

        const data = await response.json();
        let avatarUrl;

        if (data.avatar) {
            const ext = data.avatar.startsWith("a_") ? "gif" : "png";
            avatarUrl = `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.${ext}?size=512`;
        } else {
            avatarUrl = `https://cdn.discordapp.com/embed/avatars/${data.discriminator % 5}.png`;
        }

        res.json({ avatar: avatarUrl });
    } catch (err) {
        console.error("Error fetching avatar:", err);
        const fallback = `https://cdn.discordapp.com/embed/avatars/${discordId % 5}.png`;
        res.json({ avatar: fallback });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
