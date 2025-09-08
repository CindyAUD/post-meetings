export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  res.json({ message: "Bot polling stub. Recall.ai integration coming in Phase 3." });
}
