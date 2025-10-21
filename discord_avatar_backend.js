// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;

app.get("/avatar/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const response = await fetch(`https://discord.com/api/v10/users/${userId}`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` }
        });

        if (!response.ok) return res.status(404).json({ error: "User not found" });

        const data = await response.json();
        const avatar = data.avatar
            ? `https://cdn.discordapp.com/avatars/${userId}/${data.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${userId % 5}.png`;

        res.json({ avatar });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));