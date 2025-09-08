import { useEffect, useState } from "react";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    fetch("/api/meetings")
      .then((res) => res.json())
      .then((data) => setMeetings(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Meetings</h1>
      {meetings.map((m) => (
        <div key={m.id}>
          <h2>{m.CalendarEvent?.title}</h2>
          <p>{m.transcript || "No transcript yet"}</p>
        </div>
      ))}
    </div>
  );
}
