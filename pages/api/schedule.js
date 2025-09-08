import { db } from "@/models";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { platform, text, scheduledAt, userId } = req.body;

    const post = await db.ScheduledPost.create({
      id: Date.now().toString(),
      platform,
      text,
      scheduledAt: new Date(scheduledAt),
      UserId: userId,
    });

    res.json(post);
  } catch (err) {
    console.error("❌ Schedule post error:", err);
    res.status(500).json({ error: "Failed to schedule post" });
  }
}
