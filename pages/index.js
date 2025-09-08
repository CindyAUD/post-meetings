import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";

export default function Home() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch events from API
  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetch("/api/calendar");
      if (!res.ok) throw new Error("Failed to load events");
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Toggle notetaker
  async function toggleEvent(id, enabled) {
    try {
      const res = await fetch("/api/events/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });
      const updated = await res.json();
      setEvents((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, notetakerEnabled: updated.notetakerEnabled } : e
        )
      );
    } catch (err) {
      console.error(err);
    }
  }

  // Loading / not signed in state
  if (status === "loading") return <p>Loading...</p>;

  if (!session) {
    return (
      <div className="p-10">
        <h1>Post-Meeting Content Generator</h1>
        <button onClick={() => signIn("google")}>Login with Google</button>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1>Welcome {session.user.name}</h1>
      <button onClick={() => signOut()}>Logout</button>

      <div className="mt-4">
        <button onClick={loadEvents} disabled={loading}>
          {loading ? "Syncing..." : "Sync My Calendar"}
        </button>

        {events.length === 0 ? (
          <p>No events loaded yet.</p>
        ) : (
          <ul className="mt-2">
            {events.map((e) => (
              <li key={e.id} className="mb-2">
                <strong>{e.title}</strong> — {new Date(e.startTime).toLocaleString()}
                <label className="ml-4">
                  <input
                    type="checkbox"
                    checked={e.notetakerEnabled}
                    onChange={(ev) => toggleEvent(e.id, ev.target.checked)}
                  />
                  Enable Notetaker
                </label>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
