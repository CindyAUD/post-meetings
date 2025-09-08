import { useEffect, useState } from "react";

export default function Settings() {
  const [automations, setAutomations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/automations")
      .then((res) => res.json())
      .then(setAutomations);
  }, []);

  async function addAutomation(platform, type) {
    setLoading(true);
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, type }),
    });
    const newAuto = await res.json();
    setAutomations((prev) => [...prev, newAuto]);
    setLoading(false);
  }

  async function deleteAutomation(id) {
    await fetch(`/api/automations/${id}`, { method: "DELETE" });
    setAutomations((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      {/* Automations Section */}
      <section>
        <h2 className="font-semibold">Automations</h2>
        <ul className="mt-2 space-y-2">
          {automations.map((auto) => (
            <li
              key={auto.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <span>
                {auto.platform} → {auto.type}
              </span>
              <button
                onClick={() => deleteAutomation(auto.id)}
                className="text-red-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex gap-2">
          <button
            disabled={loading}
            onClick={() => addAutomation("linkedin", "marketing")}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add LinkedIn Automation
          </button>
          <button
            disabled={loading}
            onClick={() => addAutomation("facebook", "marketing")}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Add Facebook Automation
          </button>
        </div>
      </section>
    </div>
  );
}
