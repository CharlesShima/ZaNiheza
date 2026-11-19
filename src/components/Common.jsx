import { Link } from 'react-router-dom';
import BookControls from './BookControls';
import { isConfigured } from '../lib/supabase';
import { dayNum, hostName, initials, monthShort, priceText, seatsLeft, tripDateRange, formatDate } from '../lib/format';
import { THEMES } from '../lib/content';

export function Loading({ label = 'Loading' }) {
  return <div className="loading" role="status"><span className="spinner" aria-hidden="true" />{label}…</div>;
}

export function ErrorNote({ error }) {
  if (!isConfigured) return <p className="note">Connect Supabase (see README) to load live content.</p>;
  return <p className="note" role="alert">This couldn’t load: {error?.message}. Please refresh the page.</p>;
}

// Shows a real photo, or an honest placeholder. Never a stock or invented photo.
export function Photo({ src, alt, label = 'Photo from our first Trip', className = '' }) {
  if (src) return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" />;
  return (
    <div className={`ph ${className}`} role="img" aria-label={`${alt}: ${label}`}>
      <span>{label}</span>
    </div>
  );
}

export function Avatar({ src, name, size = '' }) {
  if (src) return <img className={`avatar ${size}`} src={src} alt="" loading="lazy" />;
  return <span className={`avatar ${size}`} aria-hidden="true">{initials(name)}</span>;
}

export function Stars({ value }) {
  const v = Math.round(value);
  return <span className="stars" aria-label={`${value.toFixed(1)} out of 5 stars`}>{'★'.repeat(v)}{'☆'.repeat(5 - v)}</span>;
}

export function TripCard({ trip, match, headingLevel = 3, inlineBook = false }) {
  const left = seatsLeft(trip);
  const H = `h${headingLevel}`;
  return (
    <article className="trip-card">
      <div className="trip-card__media">
        {trip.starts_at && (
          <span className="date-chip"><b>{dayNum(trip.starts_at)}</b><span>{monthShort(trip.starts_at)}</span></span>
        )}
        <span className={`seats-chip ${left === 0 ? 'seats-chip--full' : ''}`}>{left === 0 ? 'Full' : `${left} seats left`}</span>
        <Photo src={trip.cover_image} alt={trip.title} />
      </div>
      <div className="trip-card__body">
        {match && <span className="match-badge"><b>{match.score}%</b> match for you</span>}
        {trip.theme && THEMES[trip.theme] && <span className="theme-tag">{THEMES[trip.theme].name}</span>}
        <H><Link to={`/trips/${trip.slug}`}>{trip.title}</Link></H>
        <p className="trip-meta">{trip.town}, {tripDateRange(trip)}</p>
        <p className="trip-meta">{trip.host ? `Hosted by ${trip.host.name}` : hostName(trip)}</p>
        {match?.reasons?.length > 0 && <ul className="reasons">{match.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
        {trip.includes?.length > 0 && (
          <ul className="trip-list">{trip.includes.slice(0, 4).map((i) => <li key={i}>{i}</li>)}</ul>
        )}
        <div className="trip-price">
          <div><small>Price per person</small><span>{priceText(trip)}</span></div>
          {inlineBook ? <BookControls trip={trip} compact /> : <Link to={`/trips/${trip.slug}?book=1`} className="btn btn--amber btn--block">Book instantly</Link>}
        </div>
      </div>
    </article>
  );
}

export function StoryCard({ story }) {
  const live = story.status === 'published';
  return (
    <Link to={`/stories/${story.slug}`} className="story-card">
      <div className="story-card__media">
        <Photo src={story.cover_image} alt={story.title} label={live ? 'Story' : 'Photo from our first Trip'} />
      </div>
      <div className="story-card__body">
        <span className={`status-pill ${live ? 'status-pill--live' : ''}`}>{live ? 'New Story' : 'Coming soon'}</span>
        <strong>{story.title}</strong>
        <span className="small">{story.town}{story.story_date ? `, ${formatDate(story.story_date)}` : ''}</span>
        {!live && <span className="small">Coming soon — first Stories from our pilots</span>}
      </div>
    </Link>
  );
}

export function ReviewCard({ review }) {
  return (
    <article className="review">
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap' }}>
        <strong>{review.reviewer_name || 'ZaNiheza traveller'}</strong>
        <Stars value={review.rating} />
      </div>
      {review.body && <p style={{ margin: 0 }}>{review.body}</p>}
      {review.photos?.length > 0 && (
        <div className="review-photos">{review.photos.map((p) => <img key={p} src={p} alt={`Photo from ${review.trip?.title || 'the Trip'}`} loading="lazy" />)}</div>
      )}
      {review.trip && <span className="small">On <Link to={`/trips/${review.trip.slug}`}>{review.trip.title}</Link></span>}
    </article>
  );
}

export function MemberCard({ m }) {
  return (
    <div className="member">
      <Avatar src={m.avatar_url} name={m.first_name} />
      <strong>{m.first_name || 'Member'}</strong>
      <span className="small">{[m.home_city, m.country].filter(Boolean).join(', ')}</span>
      {m.interests?.length > 0 && <div className="chips">{m.interests.slice(0, 2).map((i) => <span key={i} className="chip">{i}</span>)}</div>}
    </div>
  );
}

export function Pick({ legend, options, value = [], onChange, hint }) {
  const toggle = (o) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  return (
    <fieldset>
      <legend>{legend}{hint && <span className="hint"> {hint}</span>}</legend>
      <div className="pick">
        {options.map((o) => (
          <label key={o}><input type="checkbox" checked={value.includes(o)} onChange={() => toggle(o)} />{o}</label>
        ))}
      </div>
    </fieldset>
  );
}
