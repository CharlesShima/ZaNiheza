import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import Imigongo from '../components/Imigongo';
import { Photo, PackageCard, Loading } from '../components/Common';
import { WhatsAppIcon } from '../components/WhatsAppButton';
import { useSettings } from '../lib/settings';
import { useAsync } from '../lib/useAsync';
import { getExperiences, getPackages } from '../lib/api';
import { whatsappLink } from '../lib/format';

const STEPS = [
  { title: 'Choose your theme or package', text: 'Start from one of our four experiences or a ready-made package.' },
  { title: 'Tell us about your trip', text: 'Complete the form or email us with dates, group size and interests.' },
  { title: 'Receive your itinerary', text: 'We send a day-by-day plan and price. Confirm when it feels right.' },
  { title: 'Enjoy Rwanda', text: 'A smooth, well-planned experience, with our team a message away.' },
];

const REASONS = [
  'Easy booking process',
  'Flexible travel options',
  'Experienced travel planning support',
  'Comfortable, well-managed experiences',
  'Suitable for solo travelers, families and groups',
];

const QUOTES = [
  { text: 'The Kigali Yacu experience is filled with history, culture and interactive activities. I highly recommend this experience!', who: 'Kigali Yacu traveler' },
  { text: 'It was EXCELLENT!!', who: 'ZaNiheza traveler' },
  { text: 'We really enjoyed ourselves.', who: 'ZaNiheza traveler' },
];

export default function Home() {
  const { settings } = useSettings();
  const exp = useAsync(getExperiences, []);
  const featured = useAsync(() => getPackages({ featured: true, limit: 3 }), []);

  return (
    <>
      <Seo />
      <section className={`hero ${settings.hero_image_url ? 'hero--photo' : ''}`}>
        {settings.hero_image_url && <img className="hero-bg" src={settings.hero_image_url} alt="" style={{ objectPosition: settings.hero_position || 'center 30%' }} />}
        <div className="container hero-inner">
          <p className="hero-greeting">Muraho, welcome to Rwanda</p>
          <h1>{settings.hero_title}</h1>
          <p className="hero-sub">{settings.hero_subtitle}</p>
          <div className="hero-actions">
            <Link to="/experiences" className="btn btn--amber">Explore experiences</Link>
            <a className="btn btn--ghost-light" href={whatsappLink(settings.whatsapp, 'Muraho ZaNiheza! I would like to plan a trip.')} target="_blank" rel="noreferrer">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          </div>
        </div>
        <Imigongo className="hero-band" tone="amber" />
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Four ways to know Rwanda</h2>
            <p>Each experience is a theme. Take it as a day, combine several, or let us build a full journey around it.</p>
          </div>
          {exp.loading && <Loading />}
          <div className="exp-rows">
            {(exp.data || []).map((e, i) => (
              <article key={e.id} className={`exp-row ${i % 2 ? 'exp-row--flip' : ''}`}>
                <Photo src={e.cover_image} alt={e.name} className="exp-row__img" />
                <div className="exp-row__text">
                  <h3>{e.name}<sup>™</sup></h3>
                  <p className="script">{e.tagline}</p>
                  <p>{e.summary}</p>
                  <ul className="tick-list">
                    {(e.highlights || []).slice(0, 3).map((h) => <li key={h.title}>{h.title}</li>)}
                  </ul>
                  <Link to={`/experiences/${e.slug}`} className="text-link">See {e.name}</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {featured.data?.length > 0 && (
        <section className="section section--mist">
          <div className="container">
            <div className="section-head section-head--row">
              <h2>Ready-made journeys</h2>
              <Link to="/packages" className="text-link">All packages</Link>
            </div>
            <div className="pkg-grid">
              {featured.data.map((p) => <PackageCard key={p.id} pkg={p} />)}
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-head"><h2>How it works</h2></div>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.title}><h3>{s.title}</h3><p>{s.text}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section section--navy">
        <div className="container split">
          <div>
            <h2>Why travel with ZaNiheza</h2>
            <ul className="tick-list tick-list--light">
              {REASONS.map((r) => <li key={r}>{r}</li>)}
            </ul>
          </div>
          <div className="quotes">
            {QUOTES.map((q) => (
              <blockquote key={q.text}>
                <p>{q.text}</p>
                <cite>{q.who}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="section cta-band">
        <div className="container cta-inner">
          <div>
            <h2>Retreat, honeymoon, family reunion or group trip?</h2>
            <p>Tell us who is travelling and what matters to you. We design the itinerary around it.</p>
          </div>
          <div className="cta-actions">
            <Link to="/contact" className="btn btn--navy">Plan my trip</Link>
            <a href={`mailto:${settings.email}`} className="text-link">{settings.email}</a>
          </div>
        </div>
      </section>
    </>
  );
}
