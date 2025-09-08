// pages/api/meetings/past.js
import { db } from "@/models";
import { Op } from "sequelize";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    const meetings = await db.Meeting.findAll({
      include: [{ model: db.CalendarEvent }],
      where: {
        endTime: { [Op.lt]: new Date() }, // relies on CalendarEvent.endTime existing
      },
      order: [["createdAt", "DESC"]],
    });

    res.json(meetings);
  } catch (err) {
    console.error("❌ GET /api/meetings/past", err);
    res.status(500).json({ error: "Failed to fetch past meetings" });
  }
}
