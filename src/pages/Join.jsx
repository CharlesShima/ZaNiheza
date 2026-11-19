import { Navigate, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import AuthPanel from '../components/AuthPanel';
import { useAuth } from '../lib/auth';
import { useContent } from '../lib/settings';

export default function Join() {
  const [params] = useSearchParams();
  const next = params.get('next') || '/me';
  const { user, loading } = useAuth();
  const c = useContent();
  if (!loading && user) return <Navigate to={next} replace />;
  return (
    <>
      <Seo title="Join now" description="Join ZaNiheza free with Google. Create your profile and see youth-hosted Trips matched for you." />
      <section className="section">
        <div className="container join-box">
          <div>
            <span className="kicker">Free to join</span>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)' }}>{c.join_title}</h1>
            <p className="lead">{c.join_text}</p>
            <ul className="trip-list">
              <li>Book Trips instantly on the site</li>
              <li>See the Trips matched for you, and why</li>
              <li>Get the Trip chat link after you book</li>
              <li>Become a host whenever you are ready</li>
            </ul>
          </div>
          <div className="card"><AuthPanel next={next} /></div>
        </div>
      </section>
    </>
  );
}
