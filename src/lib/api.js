import { supabase, run, isConfigured, demoCheckout } from './supabase';

const TRIP_FIELDS = '*, host:hosts(id, name, photo_url, town, languages, formats)';

export async function getTrips({ pilotsOnly = false, town, theme } = {}) {
  if (!isConfigured) return [];
  let q = supabase.from('trips').select(TRIP_FIELDS).in('status', ['approved', 'completed']).order('starts_at', { ascending: true });
  if (pilotsOnly) q = q.eq('is_pilot', true);
  if (town) q = q.eq('town', town);
  if (theme) q = q.eq('theme', theme);
  return run(q);
}
export const getTrip = (slug) => run(supabase.from('trips').select(TRIP_FIELDS).eq('slug', slug).maybeSingle());

export const getHosts = () => run(supabase.from('hosts').select('*').eq('status', 'approved').order('created_at'));
export const getHost = (id) => run(supabase.from('hosts').select('*').eq('id', id).maybeSingle());
export const getHostTrips = (hostId) =>
  run(supabase.from('trips').select('*').eq('host_id', hostId).in('status', ['approved', 'completed']).order('starts_at'));

export function getReviews({ hostId, limit, withPhotos } = {}) {
  let q = supabase.from('reviews').select('*, trip:trips(title, slug, town)').eq('status', 'published').order('created_at', { ascending: false });
  if (hostId) q = q.eq('host_id', hostId);
  if (limit) q = q.limit(limit);
  return run(q).then((rows) => (withPhotos ? rows.filter((r) => r.photos?.length) : rows));
}

export const getStories = () => run(supabase.from('stories').select('*').in('status', ['coming_soon', 'published']).order('sort_order'));
export const getStory = (slug) => run(supabase.from('stories').select('*, trip:trips(slug, title, theme)').eq('slug', slug).maybeSingle());

export const getFaqs = () => run(supabase.from('faqs').select('*').eq('is_published', true).order('sort_order'));
export const getMembers = (limit) => {
  let q = supabase.from('public_members').select('*').order('created_at', { ascending: false });
  if (limit) q = q.limit(limit);
  return run(q);
};

export const getMyBookings = (userId) =>
  run(supabase.from('bookings').select('*, trip:trips(id, slug, title, town, starts_at, ends_at)').eq('user_id', userId).order('created_at', { ascending: false }));
export const getMyReviews = (userId) => run(supabase.from('reviews').select('trip_id').eq('user_id', userId));
export const getChatLink = (tripId) => run(supabase.from('trip_private').select('chat_link').eq('trip_id', tripId).maybeSingle());

export async function startCheckout(tripId, seats) {
  if (demoCheckout) return demoCheckout(tripId, seats);
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Please join or sign in to book.');
  const res = await fetch('/.netlify/functions/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ tripId, seats }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.url) throw new Error(body.error || 'Checkout could not start. Please try again.');
  window.location.href = body.url;
}

export async function sendInquiry(values) {
  const { error } = await supabase.from('inquiries').insert(values);
  if (error) throw error;
  const key = import.meta.env.VITE_WEB3FORMS_KEY;
  if (key) {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: key, subject: `New ${values.kind} from ${values.full_name}`, from_name: 'ZaNiheza website', ...values }),
      });
    } catch { /* email copy is optional */ }
  }
}

export const STRIPE_ON = import.meta.env.VITE_STRIPE_ENABLED === 'true' || Boolean(demoCheckout);
