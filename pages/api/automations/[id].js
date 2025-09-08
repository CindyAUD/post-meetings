// pages/api/automations/[id].js
import db from "@/lib/db";
export default async function handler(req, res) {
 const { id } = req.query;
 if (req.method === "DELETE") {
   try {
     const deleted = await db.Automation.destroy({ where: { id } });
     if (!deleted) {
       return res.status(404).json({ error: "Automation not found" });
     }
     return res.json({ success: true });
   } catch (err) {
     console.error("❌ DELETE automation failed:", err);
     return res.status(500).json({ error: "Failed to delete automation" });
   }
 }
 if (req.method === "PUT") {
   try {
     const { config } = req.body;
     const [updated] = await db.Automation.update(
       { config },
       { where: { id } }
     );
     if (!updated) {
       return res.status(404).json({ error: "Automation not found" });
     }
     const automation = await db.Automation.findByPk(id);
     return res.json(automation);
   } catch (err) {
     console.error("❌ UPDATE automation failed:", err);
     return res.status(500).json({ error: "Failed to update automation" });
   }
 }
 // If not DELETE or PUT
 return res.status(405).json({ error: "Method not allowed" });
}