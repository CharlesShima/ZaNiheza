import { Link } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import { GROUPS } from '../lib/content';
import { useAsync } from '../lib/useAsync';
import { getFaqs } from '../lib/api';
import { FAQ_DEFAULTS } from '../lib/content';
import { WhatsAppIcon } from './Icons';

export function WhatsAppCommunity() {
  const { settings } = useSettings();
  const url = settings.whatsapp_community_url;
  return (
    <div className="wa-box">
      <h3>Join our Community on WhatsApp</h3>
      <p style={{ margin: 0 }}>Trip announcements, town votes and travel-buddy intros, in one friendly group.</p>
      {url ? (
        <a className="btn btn--whatsapp" href={url} target="_blank" rel="noreferrer"><WhatsAppIcon /> Join our Community on WhatsApp</a>
      ) : (
        <span className="btn btn--whatsapp" aria-disabled="true"><WhatsAppIcon /> WhatsApp Community link — to be added</span>
      )}
    </div>
  );
}

export function InterestGroups({ members }) {
  return (
    <div className="chips">
      {GROUPS.map((g) => {
        const n = (members || []).filter(g.test).length;
        return <span key={g.name} className="chip chip--navy">{g.name}{n > 0 && <b>{n}</b>}</span>;
      })}
    </div>
  );
}

export function KigaliVideo() {
  return (
    <figure className="video-card">
      <video src="/media/kigali-sunday.mp4" poster="/media/kigali-sunday.jpg" muted loop playsInline autoPlay preload="none" aria-label="Kigali on a Sunday morning: people running down a palm-lined road" />
      <figcaption>Kigali on a Sunday morning</figcaption>
    </figure>
  );
}

export function Faq({ limit }) {
  const { data } = useAsync(getFaqs, []);
  const list = (data?.length ? data : FAQ_DEFAULTS).slice(0, limit || 99);
  return (
    <div className="faq">
      {list.map((f) => (
        <details key={f.id}>
          <summary>{f.question}</summary>
          <p>{f.answer}</p>
        </details>
      ))}
    </div>
  );
}

export function HostFormats() {
  const items = [
    ['Food', 'Cook or host a meal, share food culture'],
    ['Walking tour', 'Your own town, hidden gems, no script'],
    ['Bike tour', 'Ride your favourite routes with guests'],
    ['Language & translation', 'Kinyarwanda, English or French, in real time'],
    ['Coffee together', 'A relaxed hangout for 2 to 6 people'],
    ['Content creation', 'Photo spots, filming help and Story ideas'],
  ];
  return (
    <ul className="formats">
      {items.map(([t, d]) => <li key={t}><strong>{t}</strong><span>{d}</span></li>)}
    </ul>
  );
}

export const TravellerSteps = () => (
  <ol className="steps">
    <li><span><strong>Join now</strong><span>Sign in with Google and create your profile.</span></span></li>
    <li><span><strong>Browse Trips</strong><span>See the Trips “Matched for you”, with the reasons why.</span></span></li>
    <li><span><strong>Book instantly</strong><span>Pay securely with Stripe and get your Trip chat link after booking.</span></span></li>
    <li><span><strong>Go, then review</strong><span>Review your host with photos after the Trip.</span></span></li>
  </ol>
);

export const HostSteps = () => (
  <ol className="steps">
    <li><span><strong>Join now</strong><span>Sign in with Google and create a host profile.</span></span></li>
    <li><span><strong>Get vetted by ZaNiheza</strong><span>Application, a 15-minute call or coffee, and your first Trip co-hosted.</span></span></li>
    <li><span><strong>Add a Trip</strong><span>ZaNiheza approves it and sets the final price.</span></span></li>
    <li><span><strong>Host, get reviewed, get paid</strong><span>Travellers who went review you with photos.</span></span></li>
  </ol>
);

export function HostRule() {
  return <p className="note" style={{ marginTop: '1rem' }}>Hosts are vetted. Hosts do not collect cash, set the final price alone, or publish a Trip without ZaNiheza approval.</p>;
}

export const SeeAll = ({ to, children }) => <Link to={to} className="link-arrow">{children}</Link>;
