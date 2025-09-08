import { google } from 'googleapis'
export default function handler(req,res){
const oauth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`)
const scopes = ['openid','email','profile','https://www.googleapis.com/auth/calendar.readonly']
const url = oauth2Client.generateAuthUrl({ access_type: 'offline', prompt: 'consent', scope: scopes, include_granted_scopes: true })
res.status(200).json({ url })
}