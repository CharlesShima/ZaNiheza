import { Link } from 'react-router-dom';
import Seo from '../components/Seo';

export default function NotFound() {
  return (
    <section className="section">
      <Seo title="Page not found" noindex />
      <div className="container narrow">
        <h1>This page isn't here</h1>
        <p>The link may be old, or the page was moved. Start from our experiences, or tell us what you were looking for.</p>
        <p><Link className="btn btn--navy" to="/experiences">See experiences</Link></p>
      </div>
    </section>
  );
}
