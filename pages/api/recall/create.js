import { CalendarEvent, Meeting } from "@/models";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { eventId } = req.body;
  const event = await CalendarEvent.findByPk(eventId);
  if (!event) return res.status(404).json({ error: "Event not found" });
  if (!event.meetingUrl) return res.status(400).json({ error: "No meeting URL" });

  try {
    const recallRes = await fetch("https://api.recall.ai/api/v1/bot/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RECALL_API_KEY}`,
      },
      body: JSON.stringify({
        meeting_url: event.meetingUrl,
      }),
    });

    if (!recallRes.ok) {
      const err = await recallRes.text();
      return res.status(500).json({ error: err });
    }

    const data = await recallRes.json();

    // Store bot + link it to event
    const meeting = await Meeting.create({
      id: data.id,
      botId: data.id,
      transcript: null,
      attendees: null,
      CalendarEventId: event.id,
    });

    return res.json(meeting);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Bot creation failed" });
  }
}
