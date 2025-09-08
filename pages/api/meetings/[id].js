// pages/api/meetings/[id].js
import { db } from "@/models";

export default async function handler(req, res) {
  const { id } = req.query;
  if (req.method !== "GET") return res.status(405).end();

  try {
    const meeting = await db.Meeting.findByPk(id, { include: [{ model: db.CalendarEvent }] });
    if (!meeting) return res.status(404).json({ error: "Meeting not found" });
    res.json(meeting);
  } catch (err) {
    console.error("❌ GET /api/meetings/[id]", err);
    res.status(500).json({ error: "Failed to fetch meeting" });
  }
}
