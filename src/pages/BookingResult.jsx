import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Seo from '../components/Seo';
import { Loading } from '../components/Common';
import { supabase } from '../lib/supabase';
import { getChatLink } from '../lib/api';
import { useAuth } from '../lib/auth';
import { formatDate, formatPrice } from '../lib/format';

export default function BookingResult() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const { user, loading } = useAuth();
  const [booking, setBooking] = useState(null);
  const [chat, setChat] = useState(null);
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (!user || !sessionId) return undefined;
    let stop = false;
    (async () => {
      const { data } = await supabase.from('bookings').select('*, trip:trips(id, slug, title, town, starts_at)').eq('stripe_session_id', sessionId).maybeSingle();
      if (stop) return;
      setBooking(data);
      if (data?.status === 'paid') {
        const row = await getChatLink(data.trip_id).catch(() => null);
        if (!stop) setChat(row?.chat_link || null);
      } else if (tries < 8) {
        setTimeout(() => !stop && setTries((t) => t + 1), 2000);
      }
    })();
    return () => { stop = true; };
  }, [user, sessionId, tries]);

  if (loading || (user && !booking && tries < 8 && sessionId)) return <div className="container section"><Seo title="Booking" noindex /><Loading label="Confirming your booking" /></div>;
  const paid = booking?.status === 'paid';
  return (
    <section className="section">
      <Seo title="Booking" noindex />
      <div className="container narrow center">
        {paid ? (
          <>
            <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)' }}>You’re in! Murakoze.</h1>
            <p className="lead" style={{ marginInline: 'auto' }}>{booking.seats} seat{booking.seats > 1 ? 's' : ''} on <strong>{booking.trip?.title}</strong>, {formatDate(booking.trip?.starts_at)}. Paid {formatPrice(booking.amount_total, booking.currency)}. A receipt is on its way to your email.</p>
            {chat ? <a className="btn btn--navy" href={chat} target="_blank" rel="noreferrer">Open your Trip chat</a> : <p className="note">Your Trip chat link will appear in My trips soon.</p>}
            <p style={{ marginTop: '1rem' }}><Link to="/me" className="link-arrow">Go to My trips</Link></p>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)' }}>We’re confirming your payment</h1>
            <p className="lead" style={{ marginInline: 'auto' }}>This usually takes a few seconds. Your booking will show as Confirmed in My trips, and Stripe emails your receipt.</p>
            <Link to="/me" className="btn btn--navy">Go to My trips</Link>
          </>
        )}
      </div>
    </section>
  );
}
