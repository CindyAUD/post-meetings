// pages/api/automations/index.js
//import { db } from "@/models";
import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const userId = session.user.email;

  switch (req.method) {
    case "GET": {
      const automations = await db.automation.findAll({ where: { userId } });
      return res.json(automations);
    }

    case "POST": {
      const { platform, type } = req.body;
      if (!platform || !type) {
        return res.status(400).json({ error: "Platform and type are required" });
      }

      const automation = await db.automation.create({
        data: {
          id: Date.now().toString(),
          userId,
          platform,
          type,
        },
      });

      return res.json(automation);
    }

    default:
      return res.status(405).end();
  }
}
