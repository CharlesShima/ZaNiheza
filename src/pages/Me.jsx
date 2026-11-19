import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Seo from '../components/Seo';
import PhotoField from '../components/PhotoField';
import { Loading, Pick, TripCard } from '../components/Common';
import { useAuth } from '../lib/auth';
import { supabase, uploadImage } from '../lib/supabase';
import { useAsync } from '../lib/useAsync';
import { getChatLink, getMyBookings, getMyReviews, getTrips } from '../lib/api';
import { matchedTrips } from '../lib/match';
import { INTERESTS, LANGUAGES, TOWNS, TRAVEL_STYLES } from '../lib/content';
import { formatDate, formatPrice } from '../lib/format';

export function ProfileForm({ onSaved }) {
  const { profile, user, refresh } = useAuth();
  const [v, setV] = useState(() => ({
    full_name: profile?.full_name || '', avatar_url: profile?.avatar_url || '', home_city: profile?.home_city || '',
    country: profile?.country || '', languages: profile?.languages || [], interests: profile?.interests || [],
    towns: profile?.towns || [], travel_style: profile?.travel_style || '', rwanda_from: profile?.rwanda_from || '',
    rwanda_to: profile?.rwanda_to || '', is_public: profile?.is_public ?? true, buddy_matching: profile?.buddy_matching ?? false,
  }));
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (val) => setV((x) => ({ ...x, [k]: val }));
  const ev = (k) => (e) => set(k)(e.target.type === 'checkbox' ? e.target.checked : e.target.value);

  async function save(e) {
    e.preventDefault();
    if (!v.full_name.trim()) { setMsg('Please add your name.'); return; }
    setBusy(true); setMsg('');
    const { error } = await supabase.from('profiles').update({
      ...v, rwanda_from: v.rwanda_from || null, rwanda_to: v.rwanda_to || null, profile_done: true,
    }).eq('id', user.id);
    setBusy(false);
    if (error) { setMsg(`Not saved: ${error.message}`); return; }
    await refresh();
    setMsg('Saved.');
    onSaved?.();
  }

  return (
    <form className="form card" onSubmit={save}>
      <h2 style={{ fontSize: '1.6rem', margin: 0 }}>Your profile</h2>
      <p className="muted" style={{ margin: 0 }}>8 quick questions. We use them to match you with Trips and travel buddies.</p>
      <div className="form-grid">
        <label>1. Your name<input value={v.full_name} onChange={ev('full_name')} autoComplete="name" required /></label>
        <PhotoField label="2. Your photo (optional)" value={v.avatar_url} onChange={set('avatar_url')} userId={user.id} />
        <label>3. Home city<input value={v.home_city} onChange={ev('home_city')} autoComplete="address-level2" /></label>
        <label>Country<input value={v.country} onChange={ev('country')} autoComplete="country-name" /></label>
      </div>
      <Pick legend="4. Languages you speak" options={LANGUAGES} value={v.languages} onChange={set('languages')} />
      <Pick legend="5. What you love" options={INTERESTS} value={v.interests} onChange={set('interests')} />
      <Pick legend="6. Towns you’d love to see" options={TOWNS} value={v.towns} onChange={set('towns')} />
      <label>7. Travel style
        <select value={v.travel_style} onChange={ev('travel_style')}>
          <option value="">Choose one</option>
          {TRAVEL_STYLES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <fieldset>
        <legend>8. Your dates in Rwanda <span className="hint">(leave empty if not sure yet)</span></legend>
        <div className="form-grid">
          <label>Arriving<input type="date" value={v.rwanda_from} onChange={ev('rwanda_from')} /></label>
          <label>Leaving<input type="date" value={v.rwanda_to} min={v.rwanda_from || undefined} onChange={ev('rwanda_to')} /></label>
        </div>
      </fieldset>
      <label className="check"><input type="checkbox" checked={v.is_public} onChange={ev('is_public')} /> Show my first name, city and interests on the Community page</label>
      <label className="check"><input type="checkbox" checked={v.buddy_matching} onChange={ev('buddy_matching')} /> Match me with a travel buddy for solo trips</label>
      {msg && <p className={msg === 'Saved.' ? 'form-ok' : 'form-error'} role="status">{msg}</p>}
      <button className="btn btn--navy" disabled={busy}>{busy ? 'Saving…' : 'Save my profile'}</button>
    </form>
  );
}

function ReviewForm({ booking, onDone }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function addPhotos(e) {
    const files = [...(e.target.files || [])].slice(0, 4 - photos.length);
    setBusy(true);
    try { for (const f of files) { const url = await uploadImage(f, `members/${user.id}`); setPhotos((p) => [...p, url]); } }
    catch (x) { setErr(x.message); } finally { setBusy(false); e.target.value = ''; }
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    const { error } = await supabase.from('reviews').insert({
      trip_id: booking.trip.id, user_id: user.id, rating, body, photos,
      reviewer_name: (profile?.full_name || '').split(' ')[0] || 'Traveller',
    });
    setBusy(false);
    if (error) setErr(`Not saved: ${error.message}`); else onDone();
  }
  return (
    <form className="form" onSubmit={submit} style={{ marginTop: '1rem' }}>
      <fieldset>
        <legend>Your rating</legend>
        <div className="pick">{[5, 4, 3, 2, 1].map((n) => <label key={n}><input type="radio" name={`r-${booking.id}`} checked={rating === n} onChange={() => setRating(n)} />{'★'.repeat(n)}</label>)}</div>
      </fieldset>
      <label>What was it like?<textarea value={body} onChange={(e) => setBody(e.target.value)} /></label>
      <div className="review-photos">{photos.map((p) => <img key={p} src={p} alt="" />)}</div>
      {photos.length < 4 && (
        <label className="btn btn--outline btn--small" style={{ display: 'inline-flex', justifySelf: 'start' }}>
          {busy ? 'Uploading…' : 'Add photos from the Trip'}<input type="file" accept="image/*" multiple hidden onChange={addPhotos} />
        </label>
      )}
      {err && <p className="form-error">{err}</p>}
      <button className="btn btn--navy" disabled={busy}>Publish my review</button>
    </form>
  );
}

function Bookings() {
  const { user } = useAuth();
  const [tick, setTick] = useState(0);
  const bookings = useAsync(() => getMyBookings(user.id), [user.id, tick]);
  const reviewed = useAsync(() => getMyReviews(user.id), [user.id, tick]);
  const [chats, setChats] = useState({});
  const [reviewing, setReviewing] = useState(null);

  useEffect(() => {
    (bookings.data || []).filter((b) => b.status === 'paid').forEach(async (b) => {
      const row = await getChatLink(b.trip_id).catch(() => null);
      setChats((c) => ({ ...c, [b.trip_id]: row?.chat_link || null }));
    });
  }, [bookings.data]);

  if (bookings.loading) return <Loading />;
  const list = (bookings.data || []).filter((b) => b.status !== 'cancelled');
  if (!list.length) return <div className="empty"><strong>No bookings yet</strong><Link to="/trips">Browse Trips</Link> and book your first seat.</div>;
  const done = new Set((reviewed.data || []).map((r) => r.trip_id));

  return (
    <div className="stack">
      {list.map((b) => {
        const past = b.trip?.starts_at && new Date(b.trip.starts_at) < new Date();
        return (
          <article key={b.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ margin: 0 }}><Link to={`/trips/${b.trip?.slug}`}>{b.trip?.title}</Link></h3>
                <span className="small">{b.trip?.town}, {formatDate(b.trip?.starts_at)}. {b.seats} seat{b.seats > 1 ? 's' : ''}, {formatPrice(b.amount_total, b.currency)}</span>
              </div>
              <span className={`status-pill ${b.status === 'paid' ? 'status-pill--live' : ''}`}>{b.status === 'paid' ? 'Confirmed' : b.status === 'pending' ? 'Awaiting payment' : b.status}</span>
            </div>
            {b.status === 'paid' && !past && (
              <p style={{ margin: '.75rem 0 0' }}>{chats[b.trip_id] ? <a className="btn btn--navy btn--small" href={chats[b.trip_id]} target="_blank" rel="noreferrer">Open your Trip chat</a> : <span className="small">Your Trip chat link appears here soon.</span>}</p>
            )}
            {b.status === 'paid' && past && !done.has(b.trip_id) && (
              reviewing === b.id ? <ReviewForm booking={b} onDone={() => { setReviewing(null); setTick((t) => t + 1); }} />
                : <button className="btn btn--amber btn--small" style={{ marginTop: '.75rem' }} onClick={() => setReviewing(b.id)}>Review your host</button>
            )}
            {done.has(b.trip_id) && <p className="small" style={{ margin: '.75rem 0 0' }}>Thanks for your review.</p>}
          </article>
        );
      })}
    </div>
  );
}

export default function Me() {
  const { user, profile, host, loading, signOut } = useAuth();
  const [tab, setTab] = useState(null);
  const trips = useAsync(() => getTrips(), []);
  if (loading) return <div className="container section"><Loading /></div>;
  if (!user) return <Navigate to="/join?next=/me" replace />;
  const current = tab || (profile?.profile_done ? 'matches' : 'profile');
  const upcoming = (trips.data || []).filter((t) => t.status === 'approved' && (!t.starts_at || new Date(t.starts_at) > new Date()));
  const matches = matchedTrips(profile, upcoming);

  return (
    <>
      <Seo title="My trips" noindex />
      <section className="page-head">
        <div className="container">
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>Muraho{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1>
          <p>Your matches, your bookings and your profile, all in one place.</p>
        </div>
      </section>
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <div className="tabs" role="tablist">
            {[['matches', 'Matched for you'], ['bookings', 'My bookings'], ['profile', 'My profile']].map(([k, l]) => (
              <button key={k} role="tab" aria-selected={current === k} className={current === k ? 'is-on' : ''} onClick={() => setTab(k)}>{l}</button>
            ))}
            <Link to="/host">{host ? `Host profile (${host.status})` : 'Become a host'}</Link>
            <button onClick={signOut}>Sign out</button>
          </div>

          {current === 'matches' && (
            !profile?.profile_done ? <p className="note">Finish your profile first so we can match you. <button className="btn--text btn" onClick={() => setTab('profile')}>Finish my profile</button></p>
              : trips.loading ? <Loading />
              : matches.length ? <div className="grid-3">{matches.map(({ trip, match }) => <TripCard key={trip.id} trip={trip} match={match} />)}</div>
              : <div className="empty"><strong>No matches yet</strong>Add towns, interests or your dates in Rwanda to your profile, or <Link to="/trips">browse all Trips</Link>.</div>
          )}
          {current === 'bookings' && <Bookings />}
          {current === 'profile' && <div className="narrow" style={{ maxWidth: 820 }}><ProfileForm onSaved={() => setTab('matches')} /></div>}
        </div>
      </section>
    </>
  );
}
