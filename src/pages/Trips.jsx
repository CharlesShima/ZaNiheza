import { useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { ErrorNote, Loading, TripCard } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getTrips } from '../lib/api';
import { useAuth } from '../lib/auth';
import { matchedTrips } from '../lib/match';
import { THEMES, TOWNS } from '../lib/content';
import { Link } from 'react-router-dom';

export default function Trips() {
  const [params, setParams] = useSearchParams();
  const town = params.get('town') || '';
  const theme = params.get('theme') || '';
  const { user, profile } = useAuth();
  const { data, loading, error } = useAsync(() => getTrips(), []);
  const all = data || [];
  const now = Date.now();
  const upcoming = all.filter((t) => t.status === 'approved' && (!t.starts_at || new Date(t.starts_at).getTime() > now));
  const shown = upcoming.filter((t) => (!town || t.town === town) && (!theme || t.theme === theme));
  const past = all.filter((t) => !upcoming.includes(t));
  const matches = matchedTrips(profile, upcoming);
  const set = (k, v) => { const p = Object.fromEntries(params); if (v) p[k] = v; else delete p[k]; setParams(p); };

  return (
    <>
      <Seo title="Browse Trips" description="Youth-hosted Trips in Rwanda: Kigali nights, small-town Saturdays and heritage weekends. Small groups of 15, book instantly." />
      <section className="page-head">
        <div className="container">
          <h1>Browse Trips</h1>
          <p>Small groups, youth hosts, real places. Launching first in Rwanda, in Kigali and small towns.</p>
        </div>
      </section>

      {user && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="container">
            <h2 style={{ fontSize: '1.8rem' }}>Matched for you</h2>
            {!profile?.profile_done ? (
              <p className="note">Finish your profile to see your matches. <Link to="/me">Finish my profile</Link></p>
            ) : matches.length ? (
              <div className="grid-3">{matches.slice(0, 3).map(({ trip, match }) => <TripCard key={trip.id} trip={trip} match={match} />)}</div>
            ) : (
              <p className="note">No strong matches yet. Add more towns or dates to your profile, or browse all Trips below.</p>
            )}
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="tabs" role="group" aria-label="Filter by town">
            <button className={!town ? 'is-on' : ''} onClick={() => set('town', '')}>All towns</button>
            {TOWNS.map((t) => <button key={t} className={town === t ? 'is-on' : ''} onClick={() => set('town', t)}>{t}</button>)}
          </div>
          <div className="tabs" role="group" aria-label="Filter by theme">
            <button className={!theme ? 'is-on' : ''} onClick={() => set('theme', '')}>All themes</button>
            {Object.entries(THEMES).filter(([k]) => k !== 'umwimerere').map(([k, t]) => (
              <button key={k} className={theme === k ? 'is-on' : ''} onClick={() => set('theme', k)}>{t.name}</button>
            ))}
          </div>
          {loading && <Loading />}
          {error && <ErrorNote error={error} />}
          {!loading && !shown.length && <div className="empty"><strong>No Trips here yet</strong>New Trips are added every month. Try another town, or join to be told first.</div>}
          <div className="grid-3">{shown.map((t) => <TripCard key={t.id} trip={t} match={null} />)}</div>
          <p className="small" style={{ marginTop: '1.5rem' }}>Looking for gorillas, the Big Five or a balloon flight? That’s our private arm: <Link to="/umwimerere">Umwimerere Experience™</Link>.</p>
          {past.length > 0 && (
            <>
              <h2 style={{ fontSize: '1.6rem', marginTop: '3rem' }}>Past Trips</h2>
              <div className="grid-3">{past.map((t) => <TripCard key={t.id} trip={t} />)}</div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
