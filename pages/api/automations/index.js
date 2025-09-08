import { db } from "@/models";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const automations = await db.Automation.findAll();
      return res.json(automations);
    }

    if (req.method === "POST") {
      const { platform, config } = req.body;
      const automation = await db.Automation.create({
        id: Date.now().toString(),
        platform,
        config,
      });
      return res.json(automation);
    }

    res.status(405).end();
  } catch (err) {
    console.error("❌ Automations error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
