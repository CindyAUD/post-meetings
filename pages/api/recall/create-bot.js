
import axios from "axios";

export default async function handler(req, res) {

  if (req.method !== "POST") {

    return res.status(405).json({ error: "Method not allowed" });

  }

  const { meeting_url, join_at, bot_name = "Meeting Notetaker" } = req.body;

  if (!process.env.RECALL_API_KEY) {

    return res.status(500).json({ error: "Missing Recall API key" });

  }

  try {

    const body = {

      meeting_url,

      bot_name,

      join_at,

      // minimal recording config for transcript

      recording: { transcript: true },

    };

    const response = await axios.post("https://api.recall.ai/api/v1/bot", body, {

      headers: {

        Authorization: `Token ${process.env.RECALL_API_KEY}`,

        "Content-Type": "application/json",

      },

    });

    return res.status(201).json(response.data);

  } catch (err) {

    console.error("❌ Failed to create bot:", err.response?.data || err.message);

    return res.status(500).json({

      error: "Failed to create bot",

      details: err.response?.data || err.message,

    });

  }

}
 