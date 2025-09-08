// pages/api/calendar/events.js
import { db } from "@/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { Op } from "sequelize";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  try {
    const userId = session.user.id;
    const events = await db.CalendarEvent.findAll({
      where: {
        UserId: userId,
        startTime: { [Op.gte]: new Date() },
      },
      order: [["startTime", "ASC"]],
      limit: 250,
    });

    res.json(events);
  } catch (err) {
    console.error("calendar/events error:", err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
}
