import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)


export default async function handler(req,res){
// Demo: fetch the first stored google account and list events using refresh token
const { data } = await supabase.from('google_accounts').select('*').limit(1)
if(!data || data.length===0) return res.json({ items: [] })
const acct = data[0]
const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET)
oauth2.setCredentials({ refresh_token: acct.refresh_token })
try{
const calendar = google.calendar({ version: 'v3', auth: oauth2 })
const resp = await calendar.events.list({ calendarId: 'primary', timeMin: (new Date()).toISOString(), singleEvents: true, orderBy: 'startTime', maxResults: 50 })
return res.json(resp.data)
}catch(err){
console.error(err?.response?.data || err.message)
return res.status(500).json({ error: 'failed to list events' })
}
}