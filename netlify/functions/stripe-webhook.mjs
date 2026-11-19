// Stripe calls this after payment: https://YOUR-DOMAIN/.netlify/functions/stripe-webhook
// Events to send: checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.expired
import { env, admin, stripeClient, ZERO_DECIMAL } from '../lib/shared.mjs';

export default async (req) => {
  const e = env();
  if (!e.stripeKey || !e.webhookSecret || !e.serviceKey) return new Response('Not configured', { status: 503 });

  const raw = await req.text();
  let event;
  try {
    event = await stripeClient(e).webhooks.constructEventAsync(raw, req.headers.get('stripe-signature'), e.webhookSecret);
  } catch (err) {
    return new Response(`Webhook signature check failed: ${err.message}`, { status: 400 });
  }

  const db = admin(e);
  const s = event.data.object;

  if ((event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') && s.payment_status === 'paid') {
    const cur = (s.currency || '').toUpperCase();
    const amount = s.amount_total == null ? null : ZERO_DECIMAL.has(cur) ? s.amount_total : s.amount_total / 100;
    const { error } = await db.rpc('confirm_booking', { p_session: s.id, p_payment_intent: s.payment_intent, p_amount: amount });
    if (error) return new Response(`Database error: ${error.message}`, { status: 500 });
  }

  if (event.type === 'checkout.session.expired') {
    await db.from('bookings').update({ status: 'cancelled' }).eq('stripe_session_id', s.id).eq('status', 'pending');
  }

  return new Response('ok', { status: 200 });
};
