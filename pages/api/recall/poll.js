import { Meeting } from "@/models";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { botId } = req.query;
  if (!botId) return res.status(400).json({ error: "Missing botId" });

  try {
    const recallRes = await fetch(
      `https://api.recall.ai/api/v1/bot/${botId}/transcript`,
      {
        headers: {
          Authorization: `Bearer ${process.env.RECALL_API_KEY}`,
        },
      }
    );

    if (!recallRes.ok) {
      return res.status(500).json({ error: "Failed to fetch transcript" });
    }

    const data = await recallRes.json();

    if (data?.results) {
      // Save to DB
      const meeting = await Meeting.findByPk(botId);
      if (meeting) {
        meeting.transcript = JSON.stringify(data.results);
        await meeting.save();
      }
      return res.json({ status: "done", transcript: data.results });
    }

    res.json({ status: "pending" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Polling failed" });
  }
}
