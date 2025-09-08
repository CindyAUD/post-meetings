import { useEffect, useState } from "react";

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);

  useEffect(() => {
    async function loadMeetings() {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      setMeetings(data);
    }
    loadMeetings();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">Past Meetings</h1>

      {meetings.length === 0 && <p>No meetings recorded yet.</p>}

      <ul className="space-y-4">
        {meetings.map((m) => {
          const event = m.CalendarEvent;
          let logo = "📞";
          if (event?.meetingUrl?.includes("zoom.us")) logo = "🎥 Zoom";
          if (event?.meetingUrl?.includes("google.com")) logo = "📹 Google Meet";
          if (event?.meetingUrl?.includes("teams.microsoft")) logo = "💼 Teams";

          return (
            <li
              key={m.id}
              className="border p-4 rounded-lg shadow-sm bg-white flex justify-between items-center"
            >
              <div>
                <h2 className="font-semibold">{event?.title || "Untitled"}</h2>
                <p className="text-sm text-gray-600">
                  {new Date(event?.startTime).toLocaleString()}
                </p>
                <p className="text-sm">{logo}</p>
              </div>

              <a
                href={`/meetings/${m.id}`}
                className="text-blue-600 hover:underline"
              >
                View Details →
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
