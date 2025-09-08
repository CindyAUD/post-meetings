import { db } from "@/models";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { meetingId, transcript } = req.body;

    // Save transcript
    const meeting = await db.Meeting.findByPk(meetingId);
    if (meeting) {
      meeting.transcript = transcript;
      await meeting.save();
    }

    // Run automations if any are enabled
    const automations = await db.Automation.findAll();
    for (const a of automations) {
      if (a.config.autoGenerate) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/generate-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId,
            type: a.platform,
          }),
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Recall status error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
