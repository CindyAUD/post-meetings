import { useEffect, useState } from "react";

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch("/api/calendar");
        if (!res.ok) throw new Error("Failed to load events");
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("❌ Calendar UI error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const toggleNotetaker = async (eventId, enabled) => {
    try {
      await fetch(`/api/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendarEventId: eventId,
          notetakerEnabled: enabled,
        }),
      });
    } catch (err) {
      console.error("❌ Failed to update notetaker:", err);
    }
  };

  if (loading) return <p>Loading calendar events...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📅 Upcoming Events</h1>
      {events.length === 0 ? (
        <p>No upcoming events found.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {events.map((event) => {
            const start = event.start?.dateTime || event.start?.date;
            const end = event.end?.dateTime || event.end?.date;

            return (
              <li
                key={event.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <strong>{event.summary || "(No title)"}</strong>
                <br />
                {start} → {end}
                <br />
                <label style={{ display: "block", marginTop: "0.5rem" }}>
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      toggleNotetaker(event.id, e.target.checked)
                    }
                  />{" "}
                  Enable Notetaker
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
