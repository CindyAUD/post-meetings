import { Meeting, CalendarEvent, sequelize } from "@/models";

export default async function handler(req, res) {
  
  try {
    await sequelize.sync(); // DB init here (safe, server-side only)
    const meetings = await Meeting.findAll({ include: CalendarEvent });
    res.status(200).json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch meetings" });
  }
}
