import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { Avatar, ErrorNote, Loading } from '../components/Common';
import { HostRule, HostSteps } from '../components/Sections';
import { useAsync } from '../lib/useAsync';
import { getHosts } from '../lib/api';

export default function Hosts() {
  const { data, loading, error } = useAsync(getHosts, []);
  return (
    <>
      <Seo title="Hosts" description="Meet ZaNiheza hosts: vetted local young people who host Trips in their own town in Rwanda." />
      <section className="page-head">
        <div className="container">
          <h1>Hosts</h1>
          <p>Local young people who love their town. Every host is vetted, and every first Trip is co-hosted by ZaNiheza.</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {loading && <Loading />}
          {error && <ErrorNote error={error} />}
          {!loading && !data?.length && (
            <div className="empty" style={{ marginBottom: '2rem' }}>
              <strong>Host profiles coming soon</strong>
              We are recruiting our first hosts now. Profiles appear here once they are vetted.
            </div>
          )}
          <div className="grid-3">
            {(data || []).map((h) => (
              <Link key={h.id} to={`/hosts/${h.id}`} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'grid', gap: '.6rem' }}>
                <div className="host-head">
                  <Avatar src={h.photo_url} name={h.name} />
                  <span><strong style={{ color: 'var(--navy)', fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{h.name}</strong><br /><span className="small">{h.town}</span></span>
                </div>
                <div className="chips">{h.formats?.map((f) => <span key={f} className="chip">{f}</span>)}</div>
                <span className="small">Speaks {h.languages?.join(', ') || '—'}</span>
              </Link>
            ))}
          </div>
          <div className="paths" style={{ marginTop: '3rem' }}>
            <div className="card">
              <h2 style={{ fontSize: '1.8rem' }}>Become a host</h2>
              <HostSteps />
              <HostRule />
              <Link to="/host" className="btn btn--amber" style={{ marginTop: '1rem' }}>Start my host profile</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
