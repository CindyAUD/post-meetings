// pages/api/meetings/index.js
import { db } from "@/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { Op } from "sequelize";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const userId = session.user.id;

  if (req.method === "POST") {
    // toggle notetaker for a calendar event and create meeting record
    const { calendarEventId, notetakerEnabled } = req.body;
    if (!calendarEventId) return res.status(400).json({ error: "calendarEventId required" });

    try {
      const ev = await db.CalendarEvent.findByPk(calendarEventId);
      if (!ev || ev.UserId !== userId) return res.status(404).json({ error: "Event not found" });

      ev.notetakerEnabled = !!notetakerEnabled;
      await ev.save();

      if (ev.notetakerEnabled) {
        const meetingId = `${ev.id}:${ev.startTime?.toISOString()}`;
        const [meeting, created] = await db.Meeting.findOrCreate({
          where: { id: meetingId },
          defaults: {
            id: meetingId,
            CalendarEventId: ev.id,
            platform: ev.meetingUrl?.includes("zoom") ? "zoom" : "unknown",
            status: "scheduled",
            UserId: userId,
          },
        });

        return res.json({ ok: true, meeting, created });
      } else {
        // disabled: mark meeting cancelled
        const meeting = await db.Meeting.findOne({ where: { CalendarEventId: ev.id } });
        if (meeting) {
          meeting.status = "cancelled";
          await meeting.save();
        }
        return res.json({ ok: true });
      }
    } catch (err) {
      console.error("meetings POST error:", err);
      return res.status(500).json({ error: "Failed to toggle notetaker" });
    }
  }

  if (req.method === "GET") {
    try {
      const meetings = await db.Meeting.findAll({
        where: { UserId: userId },
        include: [{ model: db.CalendarEvent }],
        order: [["createdAt", "DESC"]],
      });

      // you can filter past/upcoming client-side via CalendarEvent.startTime
      return res.json(meetings);
    } catch (err) {
      console.error("meetings GET error:", err);
      return res.status(500).json({ error: "Failed to fetch meetings" });
    }
  }

  return res.status(405).end();
}
