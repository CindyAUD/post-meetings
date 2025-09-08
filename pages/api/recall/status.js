import db from "@/models";

export default async function handler(req, res) {
  const { meetingId } = req.body;

  try {
    const meeting = await db.Meeting.findByPk(meetingId);
    if (!meeting) return res.status(404).end();

    // fetch automations for this user
    const automations = await db.Automation.findAll({
      where: { UserId: meeting.UserId },
    });

    for (const a of automations) {
      if (a.config?.autoGenerate) {
        await fetch(`${process.env.NEXTAUTH_URL}/api/generate-content`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            meetingId: meeting.id,
            type: a.platform, // e.g. "linkedin"
          }),
        });
      }
    }

    res.json({ success: true });
  } catch (err) {
    console.error("❌ recall/status automation failed", err);
    res.status(500).json({ error: "Automation trigger failed" });
  }
}
