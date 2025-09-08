import { Meeting, CalendarEvent, sequelize } from "@/models";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    await sequelize.sync();

    const meetings = await Meeting.findAll({
      include: [{ model: CalendarEvent }],
      where: {
        endTime: { [sequelize.Op.lt]: new Date() }, // only past meetings
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(meetings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch past meetings" });
  }
}
