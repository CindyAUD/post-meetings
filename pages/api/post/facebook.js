import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.facebook?.accessToken) {
    return res.status(401).json({ error: "Facebook not connected" });
  }

  const { text, pageId } = req.body;

  try {
    // Publish to Facebook Page
    const response = await fetch(
      `https://graph.facebook.com/${pageId}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          access_token: session.facebook.accessToken,
        }),
      }
    );

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
