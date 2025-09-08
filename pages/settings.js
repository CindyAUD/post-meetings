import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function Settings() {
  const { data: session, status } = useSession();
  const [automations, setAutomations] = useState([]);
  const [newPlatform, setNewPlatform] = useState("linkedin");
  const [loading, setLoading] = useState(false);

  async function loadAutomations() {
    const res = await fetch("/api/automations");
    const data = await res.json();
    // Filter automations for the current user only
    setAutomations(data);
  }

  useEffect(() => {
    if (status === "authenticated") {
      loadAutomations();
    }
  }, [status]);

  async function addAutomation() {
    setLoading(true);
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        platform: newPlatform,
        config: { autoGenerate: true, template: "" },
      }),
    });
    await res.json();
    await loadAutomations();
    setLoading(false);
  }

  async function removeAutomation(id) {
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    await loadAutomations();
  }

  if (status === "loading") return <p>Loading...</p>;
  if (status === "unauthenticated") return <p>Please login to access settings.</p>;

  // Separate automations by platform
  const linkedInAutomations = automations.filter(a => a.platform === "linkedin");
  const facebookAutomations = automations.filter(a => a.platform === "facebook");

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">⚙️ Settings</h1>

      {/* Linked Accounts */}
      <h2 className="font-semibold mb-2">Linked Accounts</h2>
      <div className="mb-6">
        {session?.linkedin ? (
          <p className="text-green-600">✅ LinkedIn connected</p>
        ) : (
          <button
            onClick={() => signIn("linkedin")}
            className="bg-blue-700 text-white px-3 py-1 rounded"
          >
            Connect LinkedIn
          </button>
        )}
      </div>

      <div className="mb-6">
        {session?.facebook ? (
          <p className="text-green-600">✅ Facebook connected</p>
        ) : (
          <button
            onClick={() => signIn("facebook")}
            className="bg-blue-600 text-white px-3 py-1 rounded"
          >
            Connect Facebook
          </button>
        )}
      </div>

      {/* Automations */}
      <h2 className="font-semibold mb-2">Automations</h2>
      <div className="mb-4">
        <select
          className="border px-2 py-1 mr-2"
          value={newPlatform}
          onChange={(e) => setNewPlatform(e.target.value)}
        >
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
        </select>
        <button
          onClick={addAutomation}
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          ➕ Add
        </button>
      </div>

      {/* LinkedIn Automations */}
      {linkedInAutomations.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">LinkedIn Automations</h3>
          <ul className="space-y-2">
            {linkedInAutomations.map(a => (
              <li key={a.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{a.config?.autoGenerate ? "Auto-generate ON" : "OFF"}</span>
                <button
                  className="text-red-600 underline"
                  onClick={() => removeAutomation(a.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Facebook Automations */}
      {facebookAutomations.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Facebook Automations</h3>
          <ul className="space-y-2">
            {facebookAutomations.map(a => (
              <li key={a.id} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                <span>{a.config?.autoGenerate ? "Auto-generate ON" : "OFF"}</span>
                <button
                  className="text-red-600 underline"
                  onClick={() => removeAutomation(a.id)}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

