// pages/api/cron.js
import db from "@/lib/db";
export default async function handler(req, res) {
 if (req.method !== "POST") {
   return res.status(405).json({ error: "Method not allowed" });
 }
 try {
   const automations = await db.Automation.findAll({
     include: [db.User],
   });
   // Here you can run scheduled tasks per automation
   console.log("Running cron for automations:", automations.length);
   return res.json({ success: true, count: automations.length });
 } catch (err) {
   console.error("❌ Cron job failed:", err);
   return res.status(500).json({ error: "Cron job failed" });
 }
}