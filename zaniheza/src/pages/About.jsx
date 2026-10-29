import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import { useSettings } from '../lib/settings';

const SERVICES = [
  ['Curated cultural & experiential tours', 'Themed experiences built with local communities.'],
  ['Accommodation', 'Hotels, lodges and guesthouses matched to your style and budget.'],
  ['Transportation & transfers', 'Airport pickups and comfortable vehicles with experienced drivers.'],
  ['Guided tours & activities', 'Knowledgeable Rwandan guides for every day of your trip.'],
  ['Custom itineraries', 'Retreats, groups, honeymoons and family reunions.'],
];

export default function About() {
  const { settings } = useSettings();
  return (
    <>
      <Seo title="About ZaNiheza" description="ZaNiheza is a Rwandan-based cultural and experiential travel company curating meaningful journeys across Rwanda." />
      <section className="page-head">
        <div className="container">
          <h1>About ZaNiheza</h1>
          <p>A Rwandan travel company. We go beyond sightseeing.</p>
        </div>
      </section>
      <section className="section">
        <div className="container split split--top">
          <div className="prose">
            {String(settings.about_text).split(/(?<=\.)\s+(?=We go|Every)/).map((t, i) => <p key={i}>{t}</p>)}
          </div>
          <div>
            <h2>What we take care of</h2>
            <dl className="highlights">
              {SERVICES.map(([t, d]) => <div key={t}><dt>{t}</dt><dd>{d}</dd></div>)}
            </dl>
            <Link to="/contact" className="btn btn--navy">Plan my trip</Link>
          </div>
        </div>
      </section>
    </>
  );
}
