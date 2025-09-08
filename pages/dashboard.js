import { useEffect, useState } from 'react'


export default function Dashboard(){
const [events, setEvents] = useState([])
const [loading, setLoading] = useState(true)


useEffect(()=>{
fetch('/api/google/list-events')
.then(r=>r.json())
.then(d=>{ setEvents(d.items || []); setLoading(false) })
.catch(e=>{ console.error(e); setLoading(false) })
},[])


return (
<div style={{padding:20}}>
<h2>Upcoming events (merged across connected Google accounts)</h2>
<p>
<a href="#" onClick={async()=>{ const r=await fetch('/api/google/consent-url'); const j=await r.json(); window.location.href=j.url }}>Connect Google account</a>
</p>


{loading ? <p>Loading...</p> : (
<div>
{events.length===0 ? <p>No upcoming events found.</p> : (
<ul>
{events.map(ev=> (
<li key={ev.id} style={{marginBottom:12}}>
<strong>{ev.summary || '(no title)'}</strong><br />
{ev.start?.dateTime || ev.start?.date} — {ev.end?.dateTime || ev.end?.date}<br />
<small>{ev.location || ev.description || 'no location'}</small>
<div style={{marginTop:6}}>
<button onClick={async()=>{
// toggle notetaker (naive demo)
const meetingUrl = ev.description || ev.location || ''
const joinAt = new Date(ev.start?.dateTime || ev.start?.date).toISOString()
const body = { meeting_url: meetingUrl, join_at: joinAt }
const res = await fetch('/api/recall/create-bot', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(body)})
const j = await res.json()
alert('Recall bot created (demo): ' + (j.id || j.botId || JSON.stringify(j)))
}}>Enable Notetaker (demo)</button>
&nbsp;
<a href={`/meeting/${encodeURIComponent(ev.id)}`}>View</a>
</div>
</li>
))}
</ul>
)}
</div>
)}
</div>
)
}