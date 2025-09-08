export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const { platform, content } = req.body;
  res.json({ message: `Stub: would post to ${platform}`, content });
}
