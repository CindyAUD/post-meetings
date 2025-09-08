// pages/meetings.js
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function MeetingsPage() {
  const { data: session, status } = useSession();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    try {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      setMeetings(data || []);
    } catch (err) {
      console.error("Failed to fetch meetings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") fetchMeetings();
  }, [status]);

  if (status === "loading" || loading) return <p>Loading meetings...</p>;
  if (!session) return <p>Please sign in first.</p>;

  const now = new Date();

  const upcoming = meetings.filter(m => {
    const st = m.CalendarEvent?.startTime;
    return st ? new Date(st) > now : false;
  });

  const past = meetings.filter(m => {
    const st = m.CalendarEvent?.startTime;
    return st ? new Date(st) <= now : false;
  });

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Meetings</h1>

      <h2>Upcoming</h2>
      {upcoming.length === 0 ? <p>No upcoming meetings.</p> : (
        <ul>
          {upcoming.map(m => (
            <li key={m.id} style={{ marginBottom: 12 }}>
              <strong>{m.CalendarEvent?.title || "(No title)"}</strong><br/>
              {m.CalendarEvent?.startTime ? new Date(m.CalendarEvent.startTime).toLocaleString() : "—"}
              <div>Notetaker: {m.CalendarEvent?.notetakerEnabled ? "✅" : "❌"}</div>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: 20 }}>Past</h2>
      {past.length === 0 ? <p>No past meetings yet.</p> : (
        <ul>
          {past.map(m => (
            <li key={m.id} style={{ marginBottom: 12 }}>
              <strong>{m.CalendarEvent?.title || "(No title)"}</strong><br/>
              {m.CalendarEvent?.startTime ? new Date(m.CalendarEvent.startTime).toLocaleString() : "—"}
              <div>Transcript: {m.transcript ? m.transcript.slice(0,120) + "…" : "No transcript yet"}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
