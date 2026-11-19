import { useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import BookControls from '../components/BookControls';
import Seo from '../components/Seo';
import { Avatar, ErrorNote, Loading, Photo } from '../components/Common';
import { useAsync } from '../lib/useAsync';
import { getTrip } from '../lib/api';
import { useAuth } from '../lib/auth';
import { matchTrip } from '../lib/match';
import { hostName, priceText, seatsLeft, tripDateRange } from '../lib/format';
import { THEMES } from '../lib/content';
import NotFound from './NotFound';

const SITE = (import.meta.env.VITE_SITE_URL || 'https://zaniheza.com').replace(/\/$/, '');

function BookBox({ trip }) {
  return (
    <aside className="card book-box" id="book" aria-label="Book this Trip">
      <div>
        <span className="small">Price per person</span>
        <div style={{ font: '800 1.6rem var(--font-display)', color: 'var(--navy)' }}>{priceText(trip)}</div>
      </div>
      <div className="facts" style={{ margin: 0 }}>
        <div className="fact"><span>Seats left</span><strong>{seatsLeft(trip)} of {trip.capacity}</strong></div>
        <div className="fact"><span>Date</span><strong>{tripDateRange(trip)}</strong></div>
      </div>
      <BookControls trip={trip} />
    </aside>
  );
}

export default function TripDetail() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { profile } = useAuth();
  const { data: trip, loading, error } = useAsync(() => getTrip(slug), [slug]);
  useEffect(() => {
    if (trip && params.get('book')) document.getElementById('book')?.scrollIntoView();
  }, [trip, params]);

  if (loading) return <div className="container section"><Loading /></div>;
  if (error) return <div className="container section"><ErrorNote error={error} /></div>;
  if (!trip) return <NotFound />;

  const match = matchTrip(profile, trip);
  const theme = THEMES[trip.theme];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Event', name: trip.title,
    description: trip.summary || trip.title, startDate: trip.starts_at, endDate: trip.ends_at || undefined,
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    location: { '@type': 'Place', name: trip.town, address: { '@type': 'PostalAddress', addressLocality: trip.town, addressCountry: 'RW' } },
    organizer: { '@type': 'Organization', name: 'ZaNiheza', url: SITE },
    image: trip.cover_image ? [trip.cover_image] : [`${SITE}/zaniheza-share-2026.jpg`],
    maximumAttendeeCapacity: trip.capacity,
    ...(trip.price ? { offers: { '@type': 'Offer', price: String(trip.price), priceCurrency: trip.currency, url: `${SITE}/trips/${trip.slug}`, availability: seatsLeft(trip) ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut' } } : {}),
  };

  return (
    <>
      <Seo title={trip.seo_title || `${trip.title}, ${trip.town}`} description={trip.seo_description || trip.summary} image={trip.cover_image} jsonLd={jsonLd} />
      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container">
          <Link to="/trips" className="crumb">← All Trips</Link>
          {params.get('booking') === 'cancelled' && <p className="note" role="status">Checkout cancelled. No payment was taken.</p>}
          <div className="detail" style={{ marginTop: '1rem' }}>
            <div>
              <div className="cover"><Photo src={trip.cover_image} alt={trip.title} /></div>
              {theme && <span className="status-pill status-pill--navy">{theme.name}</span>}
              {trip.is_pilot && <span className="status-pill" style={{ marginLeft: '.4rem' }}>Pilot Trip</span>}
              <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', marginTop: '.6rem' }}>{trip.title}</h1>
              {match && match.score > 0 && (
                <div className="note" style={{ marginBottom: '1rem' }}>
                  <strong>{match.score}% match for you.</strong> {match.reasons.join('. ')}.
                </div>
              )}
              {trip.summary && <p className="lead">{trip.summary}</p>}
              <div className="facts">
                <div className="fact"><span>When</span><strong>{tripDateRange(trip)}</strong></div>
                <div className="fact"><span>Town</span><strong>{trip.town}</strong></div>
                <div className="fact"><span>Meeting point</span><strong>{trip.meeting_point || 'Confirmed in the community'}</strong></div>
                <div className="fact"><span>Length</span><strong>{trip.duration_text || 'To be confirmed'}</strong></div>
                <div className="fact"><span>Group size</span><strong>Max {trip.capacity}</strong></div>
                <div className="fact"><span>Difficulty</span><strong>{trip.difficulty || 'Easy'}</strong></div>
              </div>
              <div className="prose">
                {String(trip.description || '').split(/\n\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
                {trip.includes?.length > 0 && (
                  <>
                    <h2>What’s included</h2>
                    <ul className="trip-list">{trip.includes.map((i) => <li key={i}>{i}</li>)}</ul>
                  </>
                )}
                <h2>Your host</h2>
                {trip.host ? (
                  <Link to={`/hosts/${trip.host.id}`} className="card host-head" style={{ textDecoration: 'none' }}>
                    <Avatar src={trip.host.photo_url} name={trip.host.name} />
                    <span><strong style={{ color: 'var(--navy)' }}>{trip.host.name}</strong><br /><span className="small">{trip.host.town}, {trip.host.languages?.join(', ')}</span></span>
                  </Link>
                ) : (
                  <p className="note">{hostName(trip)}. Our first Trips are co-hosted by ZaNiheza with vetted local youth.</p>
                )}
                {trip.gallery?.length > 0 && <div className="gallery" style={{ marginTop: '1.5rem' }}>{trip.gallery.map((g) => <img key={g} src={g} alt={trip.title} loading="lazy" />)}</div>}
              </div>
            </div>
            <BookBox trip={trip} />
          </div>
        </div>
      </section>
    </>
  );
}
