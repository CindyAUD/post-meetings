import { CalendarEvent } from "@/models";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const events = await CalendarEvent.findAll();
    return res.json(events);
  }

  if (req.method === "POST") {
    const { id, title, startTime, meetingUrl, userId } = req.body;
    const event = await CalendarEvent.create({
      id,
      title,
      startTime,
      meetingUrl,
      UserId: userId,
    });
    return res.json(event);
  }

  res.status(405).end();
}
