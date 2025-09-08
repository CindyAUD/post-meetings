import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";


export default function Settings() {
  const [automations, setAutomations] = useState([]);
  const [newPlatform, setNewPlatform] = useState("linkedin");
  const [loading, setLoading] = useState(false);

  async function loadAutomations() {
    const res = await fetch("/api/automations");
    const data = await res.json();
    setAutomations(data);
  }

  useEffect(() => {
    loadAutomations();
  }, []);

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

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">⚙️ Settings</h1>
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
      
            <h2 className="font-semibold mb-2">Facebook</h2>
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

      <ul className="space-y-3">
        {automations.map((a) => (
          <li
            key={a.id}
            className="flex justify-between items-center bg-gray-100 p-3 rounded"
          >
            <span>
              {a.platform} –{" "}
              {a.config?.autoGenerate ? "Auto-generate ON" : "OFF"}
            </span>
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
  );
  
}
