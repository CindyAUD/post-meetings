import { getToken } from "next-auth/jwt";
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    // Get JWT with Google access token
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.accessToken) {
      return res.status(401).json({ error: "Not authenticated with Google" });
    }

    // Set up Google API client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: token.accessToken });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    // Fetch upcoming 10 events
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    return res.status(200).json({ events });
  } catch (err) {
    console.error("❌ Calendar fetch failed:", err);
    res.status(500).json({ error: "Failed to fetch calendar events" });
  }
}
