// POST /.netlify/functions/create-checkout  { tripId, seats }  with the member's Supabase token.
// Checks the Trip is approved, priced and has seats, records a pending booking, and returns a Stripe Checkout link.
import { json, env, admin, stripeClient, ZERO_DECIMAL } from '../lib/shared.mjs';

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Use POST.' });
  const e = env();
  if (!e.stripeKey || !e.serviceKey || !e.supabaseUrl) {
    return json(503, { error: 'Online payment is not switched on yet. Price confirmed in the community.' });
  }

  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json(401, { error: 'Please join or sign in to book.' });

  let body;
  try { body = await req.json(); } catch { return json(400, { error: 'Invalid request.' }); }
  const seats = Math.floor(Number(body.seats));
  if (!body.tripId || !(seats >= 1 && seats <= 15)) return json(400, { error: 'Choose between 1 and 15 seats.' });

  const db = admin(e);
  const { data: auth, error: authErr } = await db.auth.getUser(token);
  if (authErr || !auth?.user) return json(401, { error: 'Your sign-in has expired. Please sign in again.' });
  const user = auth.user;

  const { data: trip } = await db.from('trips').select('*').eq('id', body.tripId).maybeSingle();
  if (!trip || trip.status !== 'approved') return json(404, { error: 'This Trip is not open for booking.' });
  if (trip.price == null || Number(trip.price) <= 0) return json(409, { error: 'The price for this Trip is not confirmed yet.' });
  if (trip.starts_at && new Date(trip.starts_at) < new Date()) return json(409, { error: 'This Trip has already started.' });
  const left = trip.capacity - trip.seats_booked;
  if (seats > left) return json(409, { error: left > 0 ? `Only ${left} seats left.` : 'This Trip is full.' });

  const { data: profile } = await db.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
  const currency = (trip.currency || 'USD').toUpperCase();
  const unitAmount = ZERO_DECIMAL.has(currency) ? Math.round(Number(trip.price)) : Math.round(Number(trip.price) * 100);
  const site = e.siteUrl || new URL(req.url).origin;

  const { data: booking, error: bookingErr } = await db.from('bookings').insert({
    trip_id: trip.id, user_id: user.id, name: profile?.full_name || null, email: user.email,
    seats, unit_amount: trip.price, amount_total: Number(trip.price) * seats, currency, status: 'pending',
  }).select().single();
  if (bookingErr) return json(500, { error: 'We couldn’t start your booking. Please try again.' });

  const when = trip.starts_at
    ? new Date(trip.starts_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Kigali' })
    : null;

  try {
    const session = await stripeClient(e).checkout.sessions.create({
      mode: 'payment',
      customer_email: user.email,
      line_items: [{
        quantity: seats,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: `ZaNiheza Trip: ${trip.title}`,
            description: [trip.town, when].filter(Boolean).join(', ') || undefined,
          },
        },
      }],
      metadata: { booking_id: booking.id, trip_id: trip.id },
      payment_intent_data: { metadata: { booking_id: booking.id, trip_id: trip.id } },
      success_url: `${site}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${site}/trips/${trip.slug}?booking=cancelled`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    });
    await db.from('bookings').update({ stripe_session_id: session.id }).eq('id', booking.id);
    return json(200, { url: session.url });
  } catch (err) {
    await db.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
    return json(502, { error: `Stripe couldn’t start checkout: ${err.message}` });
  }
};
