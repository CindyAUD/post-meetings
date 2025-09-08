import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  if (!session?.linkedin?.accessToken) {
    return res.status(401).json({ error: "Not linked to LinkedIn" });
  }

  const { text } = req.body;

  try {
    // Get the user’s LinkedIn ID (URN)
    const meRes = await fetch("https://api.linkedin.com/v2/me", {
      headers: { Authorization: `Bearer ${session.linkedin.accessToken}` },
    });
    const me = await meRes.json();

    const urn = `urn:li:person:${me.id}`;

    // Create a post
    const postRes = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.linkedin.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        author: urn,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    if (!postRes.ok) {
      const err = await postRes.text();
      throw new Error(err);
    }

    res.json({ success: true });
  } catch (err) {
    console.error("LinkedIn post error", err);
    res.status(500).json({ error: "Failed to post to LinkedIn" });
  }
}
