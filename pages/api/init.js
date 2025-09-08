import { initDb } from "@/models";

export default async function handler(req, res) {
  try {
    await initDb();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
