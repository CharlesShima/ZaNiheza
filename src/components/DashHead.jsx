import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';

// Shared top of both dashboards, with a switch between Traveller and Host
export default function DashHead({ active, subtitle }) {
  const { profile, host, signOut } = useAuth();
  const first = (profile?.full_name || '').split(' ')[0];
  return (
    <section className="page-head">
      <div className="container dash-head">
        <div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: '.2em' }}>Muraho{first ? `, ${first}` : ''}</h1>
          <p>{subtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <nav className="dash-switch" aria-label="Choose dashboard">
            <Link to="/me" className={active === 'traveller' ? 'is-on' : ''} aria-current={active === 'traveller' ? 'page' : undefined}>Traveller</Link>
            <Link to="/host" className={active === 'host' ? 'is-on' : ''} aria-current={active === 'host' ? 'page' : undefined}>{host ? 'Host' : 'Become a host'}</Link>
          </nav>
          <button className="btn btn--text" onClick={signOut}>Sign out</button>
        </div>
      </div>
    </section>
  );
}
