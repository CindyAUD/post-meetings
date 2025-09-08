// pages/api/generate-post.js
import { Configuration, OpenAIApi } from "openai";
import db from "@/lib/db";
const openai = new OpenAIApi(
 new Configuration({
   apiKey: process.env.OPENAI_API_KEY,
 })
);
export default async function handler(req, res) {
 if (req.method !== "POST") {
   return res.status(405).json({ error: "Method not allowed" });
 }
 try {
   const { meetingId, platform } = req.body;
   if (!meetingId || !platform) {
     return res.status(400).json({ error: "meetingId and platform required" });
   }
   // Fetch meeting with transcript
   const meeting = await db.Meeting.findByPk(meetingId, {
     include: [db.CalendarEvent],
   });
   if (!meeting) {
     return res.status(404).json({ error: "Meeting not found" });
   }
   const transcript = meeting.transcript || "No transcript available";
   // Generate post with OpenAI
   const response = await openai.chat.completions.create({
     model: "gpt-4o-mini",
     messages: [
       {
         role: "system",
         content: `You are a social media assistant that writes posts tailored for ${platform}.`,
       },
       {
         role: "user",
         content: `Generate a professional post from this meeting transcript:\n\n${transcript}`,
       },
     ],
   });
   const generatedPost =
     response.choices?.[0]?.message?.content || "No content generated.";
   return res.json({ platform, generatedPost });
 } catch (err) {
   console.error("❌ Post generation failed:", err);
   return res.status(500).json({ error: "Failed to generate post" });
 }
}