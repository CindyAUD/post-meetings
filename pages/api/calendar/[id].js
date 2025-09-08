// pages/api/calendar/[id].js
import { db } from "@/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]"; // adjust path if needed

export default async function handler(req, res) {
  const { id } = req.query;

  // PATCH to toggle notetakerEnabled
  if (req.method === "PATCH") {
    try {
      const { notetakerEnabled } = req.body;

      const evt = await db.CalendarEvent.findByPk(id);
      if (!evt) return res.status(404).json({ error: "Event not found" });

      evt.notetakerEnabled = Boolean(notetakerEnabled);
      await evt.save();

      // If enabling notetaker, create a Meeting and request Recall bot
      if (evt.notetakerEnabled) {
        // Create Meeting placeholder
        const meetingId = `${evt.id}-meeting`;
        const meeting = await db.Meeting.create({
          id: meetingId,
          CalendarEventId: evt.id,
          platform: evt.meetingUrl?.includes("zoom") ? "zoom" : "video",
          status: "scheduled",
        });

        // Compute join_at using user's botLeadMinutes
        let user = null;
        try {
          const session = await getServerSession(req, res, authOptions);
          if (session?.user?.id) user = await db.User.findByPk(session.user.id);
        } catch (e) {}

        const lead = (user && user.botLeadMinutes) || 5;
        const join_at = new Date(new Date(evt.startTime).getTime() - lead * 60 * 1000).toISOString();

        // Call internal bot creation route
        try {
          const createRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/meetings/create-bot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              meeting_url: evt.meetingUrl,
              join_at,
              bot_name: "Meeting Notetaker",
              meetingId: meeting.id,
            }),
          });

          const data = await createRes.json();
          if (createRes.ok) {
            meeting.botId = data.botId || data.id || data.bot?.id || null;
            meeting.status = "scheduled";
            await meeting.save();
          } else {
            console.error("Create bot failed:", data);
            meeting.status = "failed";
            await meeting.save();
          }
        } catch (err) {
          console.error("Failed calling create-bot:", err);
          meeting.status = "failed";
          await meeting.save();
        }
      } else {
        // If disabling, optionally cancel scheduled meeting / bot
        // For now: set any related meeting.status = 'cancelled'
        const meeting = await db.Meeting.findOne({ where: { CalendarEventId: evt.id } });
        if (meeting) {
          meeting.status = "cancelled";
          await meeting.save();
        }
      }

      return res.json({ id: evt.id, notetakerEnabled: evt.notetakerEnabled });
    } catch (err) {
      console.error("❌ PATCH /api/calendar/[id]", err);
      return res.status(500).json({ error: "Failed to update event" });
    }
  }

  return res.status(405).end();
}
