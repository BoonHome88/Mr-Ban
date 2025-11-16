export const handler = async (event) => {
  try {
    const payload = JSON.parse(event.body);

    const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1390666314716287007/gjFpxeI2T5Tx6odcZBSkftTLxhEtt8kCDIOTn1l35sOE09Kghp6ZtqxcktTNz4qAeGqB";

    const res = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return {
      statusCode: res.ok ? 200 : 400,
      body: JSON.stringify({ success: res.ok }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
