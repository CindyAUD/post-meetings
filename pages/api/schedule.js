import { db } from "@/lib/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { platform, text, scheduledAt } = req.body;

  const post = await db.scheduledPost.create({
    data: {
      id: Date.now().toString(),
      platform,
      text,
      scheduledAt: new Date(scheduledAt),
    },
  });

  res.json(post);
}
