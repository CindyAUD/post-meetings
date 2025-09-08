// pages/api/create-bot.js
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { meetingUrl, startTime, joinOffsetMinutes = 2 } = req.body;

  if (!meetingUrl || !startTime) {
    return res.status(400).json({ error: "meetingUrl and startTime required" });
  }

  try {
    const apiKey = process.env.RECALL_API_KEY;
    if (!apiKey) {
      throw new Error("Missing RECALL_API_KEY env variable");
    }

    // Convert to ms and adjust for join offset
    const joinTime = new Date(startTime).getTime() - joinOffsetMinutes * 60 * 1000;

    const response = await fetch("https://api.recall.ai/api/v1/bots", {
      method: "POST",
      headers: {
        "Authorization": `Token ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        call_url: meetingUrl,
        join_at: new Date(joinTime).toISOString(),
        // extra options per recall docs (e.g. transcription provider)
        transcription: { provider: "assembly_ai" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Recall API error: ${err}`);
    }

    const data = await response.json();

    // Save bot_id somewhere (DB, KV store, etc.)
    // For now, return it to frontend
    return res.status(200).json({ bot_id: data.id, ...data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
