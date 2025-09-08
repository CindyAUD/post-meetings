import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'


const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)


export default async function handler(req,res){
const { code } = req.query
if(!code) return res.status(400).send('missing code')
const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, `${process.env.NEXT_PUBLIC_BASE_URL}/api/google/callback`)
try{
const { tokens } = await oauth2.getToken(code)
// tokens may include refresh_token only on first consent
// Save tokens to Supabase for demo (service role used here)
const userEmail = 'demo-user@example.com'
await supabase.from('google_accounts').insert([{ user_email: userEmail, refresh_token: tokens.refresh_token || null, access_token: tokens.access_token, expiry_date: tokens.expiry_date || null }])
res.redirect('/dashboard')
}catch(err){
console.error(err)
res.status(500).send('error exchanging code')
}
}