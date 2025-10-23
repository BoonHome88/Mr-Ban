// backend/server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config(); // โหลดตัวแปรจาก .env

const app = express();
app.use(cors());

const BOT_TOKEN = process.env.BOT_TOKEN; // โหลดจาก Environment Variable

app.get("/discord/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const response = await fetch(`https://discord.com/api/v10/users/${id}`, {
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "ไม่พบข้อมูลผู้ใช้" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดขณะเชื่อมต่อ Discord API" });
  }
});

app.listen(3000, () =>
  console.log("✅ Backend รันที่ http://localhost:3000")
);
