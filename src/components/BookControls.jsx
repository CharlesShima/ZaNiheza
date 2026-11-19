import { useState } from 'react';
import { Link } from 'react-router-dom';
import { startCheckout, STRIPE_ON } from '../lib/api';
import { useAuth } from '../lib/auth';
import { formatPrice, seatsLeft } from '../lib/format';

// Seat selector + total + Book instantly. Used on Trip cards (landing) and the Trip page.
export default function BookControls({ trip, compact = false }) {
  const { user } = useAuth();
  const left = seatsLeft(trip);
  const [seats, setSeats] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const priced = trip.price != null && Number(trip.price) > 0;
  const started = trip.starts_at && new Date(trip.starts_at) < new Date();
  const max = Math.max(1, Math.min(left, 15));
  const labelId = `seats-${trip.id}`;

  async function book() {
    setBusy(true); setError('');
    try { await startCheckout(trip.id, seats); } catch (e) { setError(e.message); setBusy(false); }
  }

  let action;
  if (started || trip.status === 'completed') action = <button className="btn btn--navy btn--block" disabled>This Trip has taken place</button>;
  else if (left === 0) action = <button className="btn btn--navy btn--block" disabled>Full — watch for the next date</button>;
  else if (!priced || !STRIPE_ON) action = <button className="btn btn--amber btn--block" disabled>Book instantly — Stripe checkout coming soon, price confirmed in the community</button>;
  else if (!user) action = <Link className="btn btn--amber btn--block" to={`/join?next=${encodeURIComponent(`/trips/${trip.slug}?book=1`)}`}>Join free to book</Link>;
  else action = <button className="btn btn--amber btn--block" onClick={book} disabled={busy}>{busy ? 'Opening secure checkout…' : `Book ${seats} seat${seats > 1 ? 's' : ''} instantly`}</button>;

  return (
    <div className="stack" style={{ gap: compact ? '.6rem' : '1rem' }}>
      {left > 0 && !started && (
        <div className="seat-row">
          <span className="label" id={labelId}>Seats</span>
          <div className={`seat-picker ${compact ? 'seat-picker--sm' : ''}`} role="group" aria-labelledby={labelId}>
            <button type="button" aria-label="One fewer seat" onClick={() => setSeats((s) => Math.max(1, s - 1))}>−</button>
            <output aria-live="polite">{seats}</output>
            <button type="button" aria-label="One more seat" onClick={() => setSeats((s) => Math.min(max, s + 1))}>+</button>
          </div>
        </div>
      )}
      {priced && <div className="total-row"><span>Total</span><b>{formatPrice(Number(trip.price) * seats, trip.currency)}</b></div>}
      {action}
      {error && <p className="form-error" role="alert">{error}</p>}
      <p className="secure">Secure checkout powered by Stripe. Your Trip chat link arrives after booking.</p>
    </div>
  );
}
