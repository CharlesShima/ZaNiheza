import { useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import AuthPanel from '../components/AuthPanel';
import PhotoField from '../components/PhotoField';
import { Loading, Pick, ReviewCard } from '../components/Common';
import DashHead from '../components/DashHead';
import { getHostBookings, getReviews } from '../lib/api';
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
  const { data } = useAsync(() => supabase.from('trips').select('id, slug, title, status, starts_at, price, currency, seats_booked, capacity, host_payout').eq('submitted_by', user.id).order('created_at', { ascending: false }).then((r) => r.data || []), [tick]);
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
            {t.status === 'approved' && <span className="small"> {t.seats_booked} / {t.capacity} booked{t.host_payout === 'paid' ? ', paid out' : t.host_payout === 'due' ? ', payout due' : ''}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

function HostOverview({ go }) {
  const { host } = useAuth();
  const trips = useAsync(() => supabase.from('trips').select('id, title, slug, status, starts_at, seats_booked, capacity, price, currency, host_payout').eq('host_id', host.id).order('starts_at').then((r) => r.data || []), [host.id]);
  const reviews = useAsync(() => getReviews({ hostId: host.id }), [host.id]);
  const list = trips.data || [];
  const upcoming = list.filter((t) => t.status === 'approved' && t.starts_at && new Date(t.starts_at) > new Date());
  const seats = upcoming.reduce((n, t) => n + t.seats_booked, 0);
  const revs = reviews.data || [];
  const avg = revs.length ? (revs.reduce((n, r) => n + r.rating, 0) / revs.length).toFixed(1) : null;
  const due = list.filter((t) => t.host_payout === 'due').length;
  return (
    <div className="stack" style={{ gap: '1.5rem' }}>
      <StatusNote />
      <div className="stat-cards">
        <div className="stat-card"><b>{upcoming.length}</b><span>upcoming Trips</span></div>
        <div className="stat-card"><b>{seats}</b><span>seats booked</span></div>
        <div className="stat-card"><b>{avg || '—'}</b><span>{revs.length ? `average from ${revs.length} review${revs.length > 1 ? 's' : ''}` : 'no reviews yet'}</span></div>
        <div className="stat-card"><b>{due}</b><span>payouts due from ZaNiheza</span></div>
      </div>
      <div className="dash-grid">
        <div className="card">
          <h2 style={{ fontSize: '1.3rem' }}>Next Trips</h2>
          {upcoming.length ? (
            <ul className="data-list">{upcoming.slice(0, 4).map((t) => <li key={t.id}><span><strong>{t.title}</strong><br /><span className="small">{formatDate(t.starts_at)}</span></span><span className="small">{t.seats_booked} / {t.capacity} booked</span></li>)}</ul>
          ) : <p className="muted">No upcoming Trips yet.</p>}
          {host.status === 'approved' && <button className="btn btn--amber btn--small" style={{ marginTop: '1rem' }} onClick={() => go('trips')}>Add a Trip</button>}
        </div>
        <div className="card">
          <h2 style={{ fontSize: '1.3rem' }}>Your public profile</h2>
          <p className="muted">{host.status === 'approved' ? 'Travellers see your town, languages, formats, 3 places and reviews.' : 'Your profile goes public once you are vetted.'}</p>
          {host.status === 'approved' && <Link className="btn btn--outline btn--small" to={`/hosts/${host.id}`}>View it</Link>}
          <button className="btn btn--text" onClick={() => go('profile')}>Edit my host profile</button>
        </div>
      </div>
    </div>
  );
}

function StatusNote() {
  const { host } = useAuth();
  return (
    <div className="note" role="status">
      {host.status === 'pending' && <><strong>Application received.</strong> We’ll contact you for a 15-minute call or coffee. Your first Trip is co-hosted with ZaNiheza.</>}
      {host.status === 'approved' && <><strong>You’re a vetted host.</strong> Add Trips any time. ZaNiheza approves each one and sets the final price.</>}
      {host.status === 'paused' && <><strong>Your hosting is paused.</strong> Email muraho@zaniheza.com to talk about it.</>}
      {host.status === 'rejected' && <><strong>We can’t take your application right now.</strong> Email us if anything has changed.</>}
    </div>
  );
}

function HostBookings() {
  const { data, loading, error } = useAsync(getHostBookings, []);
  if (loading) return <Loading />;
  if (error) return <p className="note">Bookings will show here once the dashboard update is installed. ({error.message})</p>;
  if (!data?.length) return <div className="empty"><strong>No bookings yet</strong>When travellers book your Trips, you’ll see their first names and seats here.</div>;
  return (
    <ul className="data-list">
      {data.map((b) => (
        <li key={b.id}>
          <span><strong>{b.first_name || 'Traveller'}</strong>, {b.seats} seat{b.seats > 1 ? 's' : ''}<br /><span className="small">{b.trip_title}, {formatDate(b.starts_at)}</span></span>
          <span className={`status-pill ${b.status === 'paid' ? 'status-pill--live' : ''}`}>{b.status === 'paid' ? 'Confirmed' : 'Refunded'}</span>
        </li>
      ))}
    </ul>
  );
}

function HostReviews() {
  const { host } = useAuth();
  const { data, loading } = useAsync(() => getReviews({ hostId: host.id }), [host.id]);
  if (loading) return <Loading />;
  if (!data?.length) return <div className="empty"><strong>No reviews yet</strong>Only travellers who went on your Trip can review you, after the Trip.</div>;
  return <div className="stack">{data.map((r) => <ReviewCard key={r.id} review={r} />)}</div>;
}

export default function HostApply() {
  const { user, host, loading } = useAuth();
  const [tab, setTab] = useState('overview');
  const [tick, setTick] = useState(0);
  if (loading) return <div className="container section"><Loading /></div>;

  // Not a host yet: the application page
  if (!user || !host) {
    return (
      <>
        <Seo title="Host a Trip" description="Become a ZaNiheza host: show travellers your town in Rwanda. Get vetted, add Trips, get reviewed and paid." />
        {user ? <DashHead active="host" subtitle="Apply to host: create your host profile and we’ll be in touch." /> : (
          <section className="page-head"><div className="container"><h1>Host a Trip</h1><p>Show travellers your town. Create a host profile, get vetted, then add your own Trips.</p></div></section>
        )}
        <section className="section">
          <div className="container detail">
            <div className="stack">
              {!user ? <div className="card"><h2 style={{ fontSize: '1.6rem' }}>First, join free</h2><AuthPanel next="/host" /></div> : <HostProfileForm />}
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

  const go = (k) => { setTab(k); window.scrollTo(0, 0); };
  return (
    <>
      <Seo title="Host dashboard" noindex />
      <DashHead active="host" subtitle={`Host dashboard, ${host.town || 'Rwanda'}.`} />
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="tabs" role="tablist" aria-label="Host dashboard">
            {[['overview', 'Overview'], ['trips', 'My Trips'], ['bookings', 'Bookings'], ['reviews', 'Reviews'], ['profile', 'Host profile']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'is-on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
          {tab === 'overview' && <HostOverview go={go} />}
          {tab === 'trips' && (
            <div className="detail">
              <div className="stack">
                {host.status === 'approved' ? <AddTrip onAdded={() => setTick((t) => t + 1)} /> : <StatusNote />}
              </div>
              <aside><MyTrips tick={tick} /></aside>
            </div>
          )}
          {tab === 'bookings' && <HostBookings />}
          {tab === 'reviews' && <HostReviews />}
          {tab === 'profile' && <div style={{ maxWidth: 820 }}><HostProfileForm /></div>}
        </div>
      </section>
    </>
  );
}
