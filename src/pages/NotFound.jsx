import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <section className="section">
      <Seo title="Page not found" noindex />
      <div className="container narrow">
        <h1 style={{ fontSize: '2.4rem' }}>This page isn’t here</h1>
        <p className="lead">The link may be old. Start from our Trips, or head home.</p>
        <div className="hero-ctas"><Link className="btn btn--amber" to="/trips">Browse Trips</Link><Link className="btn btn--outline" to="/">Home</Link></div>
      </div>
    </section>
  );
}
