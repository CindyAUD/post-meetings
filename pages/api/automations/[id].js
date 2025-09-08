// pages/api/automations/[id].js
import { db } from "@/models";
//import { db } from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.query;
  const userId = session.user.email;

  if (req.method === "DELETE") {
    await db.automation.destroy({ where: { id, userId } });
    return res.json({ success: true });
  }

  return res.status(405).end();
}
