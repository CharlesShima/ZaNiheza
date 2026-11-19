import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import AuthPanel from '../components/AuthPanel';
import PhotoField from '../components/PhotoField';
import { Loading, Pick } from '../components/Common';
import { HostRule, HostSteps } from '../components/Sections';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useAsync } from '../lib/useAsync';
import { DIFFICULTY, HOST_FORMATS, INTERESTS, LANGUAGES, TOWNS, THEMES } from '../lib/content';
import { slugify, formatDate } from '../lib/format';

export function HostProfileForm({ compactIntro = false }) {
  const { user, profile, host, refresh } = useAuth();
  const [v, setV] = useState(() => ({
    name: host?.name || profile?.full_name || '', photo_url: host?.photo_url || profile?.avatar_url || '', town: host?.town || '',
    languages: host?.languages || [], formats: host?.formats || [], three_places: host?.three_places?.length ? host.three_places : ['', '', ''],
    availability: host?.availability || '', bio: host?.bio || '',
  }));
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setV((x) => ({ ...x, [k]: val }));

  async function save(e) {
    e.preventDefault();
    if (!v.town || !v.formats.length) { setMsg('Choose your town and at least one way to host.'); return; }
    setBusy(true); setMsg('');
    const payload = { ...v, three_places: v.three_places.map((p) => p.trim()).filter(Boolean) };
    const { error } = host
      ? await supabase.from('hosts').update(payload).eq('id', host.id)
      : await supabase.from('hosts').insert({ ...payload, user_id: user.id, status: 'pending' });
    setBusy(false);
    if (error) { setMsg(`Not saved: ${error.message}`); return; }
    await refresh();
    setMsg('Saved.');
  }

  return (
    <form className="form card" onSubmit={save}>
      <h2 style={{ fontSize: '1.6rem', margin: 0 }}>{host ? 'Your host profile' : 'Create your host profile'}</h2>
      <div className="form-grid">
        <label>Name<input required value={v.name} onChange={(e) => set('name')(e.target.value)} /></label>
        <label>Your town
          <select required value={v.town} onChange={(e) => set('town')(e.target.value)}>
            <option value="">Choose your town</option>
            {TOWNS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </label>
      </div>
      <PhotoField label="Photo (a clear photo of you)" value={v.photo_url} onChange={set('photo_url')} userId={user.id} />
      <Pick legend="Languages" options={LANGUAGES} value={v.languages} onChange={set('languages')} />
      <Pick legend="How you’d like to host" options={HOST_FORMATS} value={v.formats} onChange={set('formats')} />
      <fieldset>
        <legend>My town in 3 places <span className="hint">(the places you’d show a friend)</span></legend>
        <div className="stack">
          {v.three_places.map((p, i) => (
            <input key={i} aria-label={`Place ${i + 1}`} value={p} placeholder={`Place ${i + 1}`} onChange={(e) => set('three_places')(v.three_places.map((x, j) => (j === i ? e.target.value : x)))} />
          ))}
        </div>
      </fieldset>
      <label>Availability<input value={v.availability} placeholder="e.g. Saturdays, and weekday evenings" onChange={(e) => set('availability')(e.target.value)} /></label>
      <label>About you<textarea value={v.bio} placeholder="Why you love your town, what you study or do" onChange={(e) => set('bio')(e.target.value)} /></label>
      {msg && <p className={msg === 'Saved.' ? 'form-ok' : 'form-error'} role="status">{msg}</p>}
      <button className="btn btn--navy" disabled={busy}>{busy ? 'Saving…' : host ? 'Save changes' : 'Send my application'}</button>
    </form>
  );
}

const BLANK_TRIP = { title: '', theme: 'kigali-yacu', format: '', town: '', starts_at: '', ends_at: '', duration_text: '', meeting_point: '', capacity: 12, includes: '', difficulty: 'Easy', price_suggestion: '', cover_image: '', summary: '', interests: [], languages: ['English'] };

export function AddTrip({ onAdded }) {
  const { user, host } = useAuth();
  const [v, setV] = useState({ ...BLANK_TRIP, town: host.town || '', languages: host.languages?.length ? host.languages : ['English'] });
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setV((x) => ({ ...x, [k]: val }));
  const ev = (k) => (e) => set(k)(e.target.value);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const { error } = await supabase.from('trips').insert({
      title: v.title, slug: `${slugify(v.title)}-${Math.random().toString(36).slice(2, 6)}`, theme: v.theme, format: v.format, town: v.town,
      starts_at: v.starts_at ? new Date(v.starts_at).toISOString() : null, ends_at: v.ends_at ? new Date(v.ends_at).toISOString() : null,
      duration_text: v.duration_text, meeting_point: v.meeting_point, capacity: Math.min(15, Math.max(1, Number(v.capacity) || 15)),
      includes: v.includes.split('\n').map((s) => s.trim()).filter(Boolean), difficulty: v.difficulty,
      price_suggestion: v.price_suggestion === '' ? null : Number(v.price_suggestion), cover_image: v.cover_image || null,
      summary: v.summary, interests: v.interests, languages: v.languages,
      host_id: host.id, host_label: host.name, submitted_by: user.id, status: 'pending', price: null,
    });
    setBusy(false);
    if (error) { setMsg(`Not sent: ${error.message}`); return; }
    setV({ ...BLANK_TRIP, town: host.town || '' });
    setMsg('Sent. Pending review — ZaNiheza will approve it before it goes live.');
    onAdded();
  }

  return (
    <form className="form card" onSubmit={submit}>
      <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Add a Trip</h2>
      <div className="form-grid">
        <label className="span-2">Trip title<input required value={v.title} onChange={ev('title')} placeholder="e.g. Kimironko market & coffee" /></label>
        <label>Format<select required value={v.format} onChange={ev('format')}><option value="">Choose</option>{HOST_FORMATS.map((f) => <option key={f}>{f}</option>)}</select></label>
        <label>Theme<select value={v.theme} onChange={ev('theme')}>{Object.entries(THEMES).filter(([k]) => k !== 'umwimerere').map(([k, t]) => <option key={k} value={k}>{t.name}</option>)}</select></label>
        <label>Town<select required value={v.town} onChange={ev('town')}><option value="">Choose</option>{TOWNS.map((t) => <option key={t}>{t}</option>)}</select></label>
        <label>Meeting point<input value={v.meeting_point} onChange={ev('meeting_point')} /></label>
        <label>Starts<input type="datetime-local" required value={v.starts_at} onChange={ev('starts_at')} /></label>
        <label>Ends<input type="datetime-local" value={v.ends_at} onChange={ev('ends_at')} /></label>
        <label>Duration<input value={v.duration_text} onChange={ev('duration_text')} placeholder="e.g. 4 hours" /></label>
        <label>Capacity (max 15)<input type="number" min="1" max="15" value={v.capacity} onChange={ev('capacity')} /></label>
        <label>Difficulty<select value={v.difficulty} onChange={ev('difficulty')}>{DIFFICULTY.map((d) => <option key={d}>{d}</option>)}</select></label>
        <label>Price suggestion per person (USD)<input type="number" min="0" value={v.price_suggestion} onChange={ev('price_suggestion')} /><span className="hint">ZaNiheza sets the final price.</span></label>
        <label className="span-2">Short description<textarea value={v.summary} onChange={ev('summary')} /></label>
        <label className="span-2">What’s included <span className="hint">(one per line)</span><textarea value={v.includes} onChange={ev('includes')} /></label>
      </div>
      <Pick legend="Good for people who love" options={INTERESTS} value={v.interests} onChange={set('interests')} />
      <Pick legend="Hosted in" options={LANGUAGES} value={v.languages} onChange={set('languages')} />
      <PhotoField label="Photo (a real photo of the place or activity)" value={v.cover_image} onChange={set('cover_image')} userId={user.id} round={false} />
      {msg && <p className={msg.startsWith('Sent') ? 'form-ok' : 'form-error'} role="status">{msg}</p>}
      <button className="btn btn--amber" disabled={busy}>{busy ? 'Sending…' : 'Send for review'}</button>
    </form>
  );
}

export function MyTrips({ tick }) {
  const { user } = useAuth();
  const { data } = useAsync(() => supabase.from('trips').select('id, slug, title, status, starts_at, price').eq('submitted_by', user.id).order('created_at', { ascending: false }).then((r) => r.data || []), [tick]);
  if (!data?.length) return null;
  const label = { pending: 'Pending review — ZaNiheza will approve it before it goes live.', approved: 'Live', paused: 'Paused', completed: 'Completed', rejected: 'Not approved', draft: 'Draft' };
  return (
    <div className="card">
      <h2 style={{ fontSize: '1.4rem' }}>My Trips</h2>
      <ul className="stack" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {data.map((t) => (
          <li key={t.id}>
            <strong>{t.status === 'approved' ? <Link to={`/trips/${t.slug}`}>{t.title}</Link> : t.title}</strong>
            <span className="small"> {formatDate(t.starts_at)}</span><br />
            <span className={`status-pill ${t.status === 'approved' ? 'status-pill--live' : ''}`}>{label[t.status]}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HostApply() {
  const { user, host, loading } = useAuth();
  const [tick, setTick] = useState(0);
  if (loading) return <div className="container section"><Loading /></div>;
  return (
    <>
      <Seo title="Host a Trip" description="Become a ZaNiheza host: show travellers your town in Rwanda. Get vetted, add Trips, get reviewed and paid." />
      <section className="page-head">
        <div className="container">
          <h1>Host a Trip</h1>
          <p>Show travellers your town. Create a host profile, get vetted, then add your own Trips.</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail">
          <div className="stack">
            {!user ? (
              <div className="card"><h2 style={{ fontSize: '1.6rem' }}>First, join free</h2><AuthPanel next="/host" /></div>
            ) : (
              <>
                {host && (
                  <div className={`note`} role="status">
                    {host.status === 'pending' && <><strong>Application received.</strong> We’ll contact you for a 15-minute call or coffee. Your first Trip is co-hosted with ZaNiheza.</>}
                    {host.status === 'approved' && <><strong>You’re a vetted host.</strong> Add Trips below. <Link to={`/hosts/${host.id}`}>See your public profile</Link></>}
                    {host.status === 'paused' && <><strong>Your hosting is paused.</strong> Email muraho@zaniheza.com to talk about it.</>}
                    {host.status === 'rejected' && <><strong>We can’t take your application right now.</strong> Email us if anything has changed.</>}
                  </div>
                )}
                {host?.status === 'approved' && <AddTrip onAdded={() => setTick((t) => t + 1)} />}
                {host && <MyTrips tick={tick} />}
                <HostProfileForm />
              </>
            )}
          </div>
          <aside className="card">
            <h2 style={{ fontSize: '1.4rem' }}>How hosting works</h2>
            <HostSteps />
            <HostRule />
          </aside>
        </div>
      </section>
    </>
  );
}
