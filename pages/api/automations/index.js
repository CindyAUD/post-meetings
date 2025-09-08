// pages/api/automations/index.js
import db from "@/lib/db";
export default async function handler(req, res) {
 if (req.method === "GET") {
   try {
     const automations = await db.Automation.findAll();
     return res.json(automations);
   } catch (err) {
     console.error("❌ GET automations failed:", err);
     return res.status(500).json({ error: "Failed to fetch automations" });
   }
 }
 if (req.method === "POST") {
   try {
     const { platform, config, userId } = req.body;
     if (!platform || !userId) {
       return res.status(400).json({ error: "platform and userId required" });
     }
     const automation = await db.Automation.create({
       platform,
       config,
       UserId: userId,
     });
     return res.status(201).json(automation);
   } catch (err) {
     console.error("❌ POST automation failed:", err);
     return res.status(500).json({ error: "Failed to create automation" });
   }
 }
 return res.status(405).json({ error: "Method not allowed" });
}