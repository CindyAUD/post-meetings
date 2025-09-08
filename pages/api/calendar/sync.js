// pages/api/calendar/sync.js
import { google } from "googleapis";
import { db } from "@/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) return res.status(401).json({ error: "Unauthorized" });

  try {
    const userId = session.user.id;
    const googleAccounts = await db.Account.findAll({
      where: { UserId: userId, provider: "google" },
    });

    let total = 0;
    const allEvents = [];

    for (const acc of googleAccounts) {
      if (!acc.accessToken && !acc.refreshToken) continue;

      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
      );

      // set credentials; include refresh token if present
      const creds = {
        access_token: acc.accessToken,
      };
      if (acc.refreshToken) creds.refresh_token = acc.refreshToken;
      oauth2Client.setCredentials(creds);

      // attempt to refresh/get valid access token before API call
      try {
        await oauth2Client.getAccessToken(); // triggers auto-refresh if needed
      } catch (err) {
        console.warn("Google token refresh warning for account:", acc.providerAccountId, err.message || err);
        // continue and try request (might fail)
      }

      const calendar = google.calendar({ version: "v3", auth: oauth2Client });

      // fetch next 14 days
      const timeMin = new Date().toISOString();
      const timeMax = new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString();

      try {
        const resp = await calendar.events.list({
          calendarId: "primary",
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 250,
        });

        const items = resp.data.items || [];
        for (const e of items) {
          const start = e.start?.dateTime || e.start?.date;
          const end = e.end?.dateTime || e.end?.date;
          const description = e.description || "";
          const meetingUrl =
            e.hangoutLink ||
            (e.conferenceData && e.conferenceData.entryPoints?.[0]?.uri) ||
            (description.match(/https?:\/\/[^\s)]+/g) || [null])[0] ||
            null;

          // unique id per account + event id so multi-account doesn't conflict
          const id = `${acc.providerAccountId}:${e.id}`;

          await db.CalendarEvent.upsert({
            id,
            title: e.summary || "(No title)",
            startTime: start ? new Date(start) : null,
            endTime: end ? new Date(end) : null,
            meetingUrl,
            provider: "google",
            providerAccountId: acc.providerAccountId,
            UserId: userId,
            notetakerEnabled: false,
          });

          total++;
          allEvents.push({ id, title: e.summary, start, end, meetingUrl });
        }
      } catch (err) {
        console.error("Error fetching calendar for account", acc.providerAccountId, err.message || err);
      }
    }

    return res.json({ synced: total, events: allEvents });
  } catch (err) {
    console.error("calendar/sync failed:", err);
    return res.status(500).json({ error: "Sync failed", details: err.message });
  }
}
