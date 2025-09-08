import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function MeetingDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiContent, setAiContent] = useState({ email: "", linkedin: "" });
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!id) return;
    async function loadMeeting() {
      const res = await fetch("/api/meetings");
      const data = await res.json();
      const found = data.find((m) => m.id === id);
      setMeeting(found);
    }
    loadMeeting();
  }, [id]);

  async function generate(type) {
    setLoading(true);
    const res = await fetch("/api/generate-content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ meetingId: id, type }),
    });
    const data = await res.json();
    setAiContent((prev) => ({ ...prev, [type]: data.content }));
    setLoading(false);
  }

  function copyToClipboard(type) {
    navigator.clipboard.writeText(aiContent[type]);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  }

  if (!meeting) return <p className="p-10">Loading...</p>;

  const event = meeting.CalendarEvent;

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-2">{event?.title}</h1>
      <p className="text-gray-600 mb-4">
        {new Date(event?.startTime).toLocaleString()}
      </p>

      <h2 className="font-semibold mb-2">Transcript</h2>
      {!meeting.transcript ? (
        <p>No transcript yet.</p>
      ) : (
        <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded mb-6">
          {JSON.parse(meeting.transcript)
            .map((t) => `${t.speaker}: ${t.text}`)
            .join("\n")}
        </pre>
      )}

      <h2 className="font-semibold mb-2">AI Tools</h2>
      <div className="space-x-4 mb-4">
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          disabled={loading}
          onClick={() => generate("email")}
        >
          ✉️ Generate Follow-up Email
        </button>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          disabled={loading}
          onClick={() => generate("linkedin")}
        >
          💼 Generate LinkedIn Post
        </button>
      </div>

      {aiContent.email && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold">📧 Email Draft</h3>
            <button
              className="text-sm text-blue-600 underline"
              onClick={() => copyToClipboard("email")}
            >
              {copied === "email" ? "✅ Copied!" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
            {aiContent.email}
          </pre>
        </div>
      )}

      {aiContent.linkedin && (
  <div>
    <div className="flex justify-between items-center mb-1">
      <h3 className="font-semibold">💼 LinkedIn Post Draft</h3>
      <div className="space-x-3">
        <button
          className="text-sm text-blue-600 underline"
          onClick={() => copyToClipboard("linkedin")}
        >
          {copied === "linkedin" ? "✅ Copied!" : "Copy"}
        </button>
        <button
          className="text-sm text-green-600 underline"
          onClick={async () => {
            const res = await fetch("/api/post/linkedin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: aiContent.linkedin }),
            });
            if (res.ok) alert("✅ Posted to LinkedIn!");
            else alert("❌ Failed to post.");
          }}
        >
          Post
        </button>
      </div>
    </div>
    <pre className="whitespace-pre-wrap bg-gray-50 p-3 rounded">
      {aiContent.linkedin}
    </pre>
    <div className="border border-gray-300 rounded-lg p-4 my-2 bg-white shadow-sm">
      <p className="font-bold text-blue-800 mb-2">LinkedIn Preview</p>
      <p className="whitespace-pre-wrap">{aiContent.linkedin}</p>
    </div>
  </div>
)}
   {aiContent.facebook && (
  <div>
    <div className="flex justify-between items-center mb-1">
      <h3 className="font-semibold">📘 Facebook Post Draft</h3>
      <div className="space-x-3">
        <button
          className="text-sm text-blue-600 underline"
          onClick={() => copyToClipboard("facebook")}
        >
          {copied === "facebook" ? "✅ Copied!" : "Copy"}
        </button>
        <button
          className="text-sm text-green-600 underline"
          onClick={async () => {
            const res = await fetch("/api/post/facebook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                text: aiContent.facebook,
                pageId: process.env.FACEBOOK_PAGE_ID, // set in .env
              }),
            });
            if (res.ok) alert("✅ Posted to Facebook!");
            else alert("❌ Failed to post.");
          }}
        >
          Post
        </button>
      </div>
    </div>

    {/* Preview */}
    <div className="border border-gray-300 rounded-lg p-4 my-2 bg-white shadow-sm">
      <p className="font-bold text-blue-800 mb-2">Facebook Preview</p>
      <p className="whitespace-pre-wrap">{aiContent.facebook}</p>
    </div>
  </div>
)}


    </div>
  );
}
