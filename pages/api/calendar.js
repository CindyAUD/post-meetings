import { getToken } from "next-auth/jwt";
import { google } from "googleapis";
import { CalendarEvent } from "@/models";

export default async function handler(req, res) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: token.accessToken });

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  const events = await calendar.events.list({
    calendarId: "primary",
    timeMin: new Date().toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: "startTime",
  });

  const items = events.data.items || [];

  // Save/update events in DB
  for (const ev of items) {
    const zoomLink =
      ev.hangoutLink ||
      (ev.conferenceData?.entryPoints?.[0]?.uri ?? null) ||
      (ev.description?.match(/https:\/\/[^\s]+zoom\.us\/[^\s]+/)?.[0] ?? null);

    await CalendarEvent.upsert({
      id: ev.id,
      title: ev.summary || "Untitled Event",
      startTime: ev.start?.dateTime || ev.start?.date,
      meetingUrl: zoomLink,
      notetakerEnabled: false,
      UserId: token.sub,
    });
  }

  // Return synced events
  const saved = await CalendarEvent.findAll({
    where: { UserId: token.sub },
    order: [["startTime", "ASC"]],
  });

  res.json(saved);
}
