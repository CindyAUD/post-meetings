import db from "@/lib/db";

export default async function handler(req, res) {

  try {

    // Example: load all automations (Sequelize equivalent of findMany)

    const automations = await db.Automation.findAll();

    for (const a of automations) {

      if (a.config?.autoGenerate) {

        await fetch(`${process.env.NEXTAUTH_URL}/api/generate-content`, {

          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({

            meetingId: req.body.meetingId, // assuming meetingId comes from request

            type: a.platform, // e.g. "linkedin"

          }),

        });

      }

    }

    return res.json({ success: true });

  } catch (err) {

    console.error("❌ Recall status error:", err);

    return res.status(500).json({ error: "Failed to process status" });

  }

}
 