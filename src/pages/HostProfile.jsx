import { Link, useParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { Avatar, Loading, ReviewCard, Stars, TripCard } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getHost, getHostTrips, getReviews } from '../lib/api';
import NotFound from './NotFound';

export default function HostProfile() {
  const { id } = useParams();
  const host = useAsync(() => getHost(id), [id]);
  const trips = useAsync(() => getHostTrips(id), [id]);
  const reviews = useAsync(() => getReviews({ hostId: id }), [id]);

  if (host.loading) return <div className="container section"><Loading /></div>;
  const h = host.data;
  if (!h || h.status !== 'approved') return <NotFound />;

  const hosted = (trips.data || []).filter((t) => t.status === 'completed' || (t.starts_at && new Date(t.starts_at) < new Date())).length;
  const list = reviews.data || [];
  const avg = list.length ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;
  const upcoming = (trips.data || []).filter((t) => t.status === 'approved' && (!t.starts_at || new Date(t.starts_at) > new Date()));

  return (
    <>
      <Seo title={`${h.name}, host in ${h.town}`} description={h.bio || `${h.name} hosts ZaNiheza Trips in ${h.town}.`} image={h.photo_url} />
      <section className="page-head">
        <div className="container host-head">
          <Avatar src={h.photo_url} name={h.name} size="avatar--lg" />
          <div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '.2em' }}>{h.name}</h1>
            <p>{h.town}. Speaks {h.languages?.join(', ')}.</p>
            {hosted === 0 || !list.length ? (
              <p style={{ marginTop: '.5rem' }}><span className="status-pill">New host — first Trip co-hosted by ZaNiheza</span></p>
            ) : (
              <p style={{ marginTop: '.5rem' }}><Stars value={avg} /> <strong>{avg.toFixed(1)}</strong> from {list.length} review{list.length > 1 ? 's' : ''}, {hosted} Trip{hosted > 1 ? 's' : ''} hosted</p>
            )}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container detail">
          <div className="prose">
            {h.bio && <p className="lead">{h.bio}</p>}
            <h2>Hosts</h2>
            <div className="chips">{h.formats?.map((f) => <span key={f} className="chip">{f}</span>)}</div>
            {h.three_places?.length > 0 && (
              <>
                <h2>My town in 3 places</h2>
                <ol className="trip-list">{h.three_places.map((p) => <li key={p}>{p}</li>)}</ol>
              </>
            )}
            {h.availability && (<><h2>Availability</h2><p>{h.availability}</p></>)}
            <h2>Reviews</h2>
            {list.length ? <div className="stack">{list.map((r) => <ReviewCard key={r.id} review={r} />)}</div>
              : <p className="muted">No reviews yet. Only travellers who went on a Trip with {h.name.split(' ')[0]} can leave one.</p>}
          </div>
          <aside className="stack">
            <h2 style={{ fontSize: '1.5rem' }}>Upcoming Trips</h2>
            {upcoming.length ? upcoming.map((t) => <TripCard key={t.id} trip={{ ...t, host: h }} />) : <p className="muted">No upcoming Trips right now.</p>}
            <Link to="/hosts" className="crumb">← All hosts</Link>
          </aside>
        </div>
      </section>
    </>
  );
}
