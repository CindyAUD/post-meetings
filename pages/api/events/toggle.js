import { CalendarEvent } from "@/models";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { id, enabled } = req.body;

  const event = await CalendarEvent.findByPk(id);
  if (!event) return res.status(404).json({ error: "Event not found" });

  event.notetakerEnabled = enabled;
  await event.save();

  res.json(event);
}
