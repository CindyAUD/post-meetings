// pages/api/settings.js
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";
import { db } from "@/models";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  const userId = session.user.id;

  if (req.method === "GET") {
    const user = await db.User.findByPk(userId, { attributes: ["id", "email", "name", "botLeadMinutes"] });
    const accounts = await db.Account.findAll({
      where: { UserId: userId },
      attributes: ["id", "provider", "providerAccountId"],
    });
    return res.json({ user, accounts });
  }

  if (req.method === "PUT") {
    const { botLeadMinutes } = req.body;
    if (typeof botLeadMinutes !== "number") return res.status(400).json({ error: "botLeadMinutes must be a number" });
    await db.User.update({ botLeadMinutes }, { where: { id: userId } });
    const user = await db.User.findByPk(userId, { attributes: ["id", "botLeadMinutes"] });
    return res.json(user);
  }

  return res.status(405).end();
}
