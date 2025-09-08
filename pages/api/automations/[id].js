import { db } from "@/models";

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    if (req.method === "DELETE") {
      await db.Automation.destroy({ where: { id } });
      return res.json({ success: true });
    }

    if (req.method === "PUT") {
      const { config } = req.body;
      const automation = await db.Automation.update(
        { config },
        { where: { id }, returning: true }
      );
      return res.json(automation);
    }

    res.status(405).end(); // method not allowed
  } catch (err) {
    console.error("❌ Automation handler error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
