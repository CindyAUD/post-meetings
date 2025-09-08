import db from "@/models";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { meetingId, type } = req.body;

  try {
    // fetch meeting + transcript
    const meeting = await db.Meeting.findByPk(meetingId, {
      include: db.CalendarEvent,
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    // ask OpenAI to generate content
    const prompt = `Summarize this meeting into a ${type} social media post:\n\n${meeting.transcript}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;

    // save generated post in DB
    const GeneratedPost = db.sequelize.define("GeneratedPost", {
      id: { type: db.sequelize.Sequelize.STRING, primaryKey: true },
      platform: db.sequelize.Sequelize.STRING,
      content: db.sequelize.Sequelize.TEXT,
    });

    await GeneratedPost.sync();

    const post = await GeneratedPost.create({
      id: Date.now().toString(),
      meetingId,
      platform: type,
      content,
    });

    res.json({ post });
  } catch (err) {
    console.error("❌ generate-content failed", err);
    res.status(500).json({ error: "Failed to generate content" });
  }
}
