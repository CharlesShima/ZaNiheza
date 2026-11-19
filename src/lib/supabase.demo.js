// PREVIEW ONLY (npm run build:demo): an in-browser stand-in for Supabase with the real starting content.
// No fake hosts, prices, reviews or members. Edits stay in this browser.
import { FAQ_DEFAULTS } from './content';

const KEY = 'zaniheza-demo-v2';
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);
const now = () => new Date().toISOString();

function seed() {
  const pilot = (o) => ({
    id: uid(), status: 'approved', is_pilot: true, capacity: 15, seats_booked: 0, price: null, currency: 'USD', price_suggestion: null,
    cover_image: null, gallery: [], host_id: null, host_label: 'Host to be confirmed', difficulty: 'Easy', meeting_point: 'Confirmed in the community',
    description: '', host_payout: 'not_due', submitted_by: null, seo_title: '', seo_description: '', created_at: now(), updated_at: now(), ...o,
  });
  const trips = [
    pilot({ slug: 'kigali-yacu-night', title: 'Kigali Yacu Night', theme: 'kigali-yacu', town: 'Kigali', format: 'Walking tour',
      summary: 'An evening walk and a youth-hosted dinner: the Kigali locals actually live.', starts_at: '2026-12-05T15:00:00Z', ends_at: '2026-12-05T19:30:00Z',
      duration_text: 'Saturday evening', includes: ['Evening walk with a Kigali host', 'Dinner hosted by a local youth host', 'Content buddy for photos & Stories', 'Trip chat link after booking'],
      interests: ['Food', 'Walking', 'Photography & content', 'Music'], languages: ['English', 'Kinyarwanda'] }),
    pilot({ slug: 'nyanza-small-town-saturday', title: 'Nyanza Small-Town Saturday', theme: 'umwami', town: 'Nyanza', format: 'Walking tour',
      summary: 'King’s Palace Museum, the Inyambo cows and a heritage lunch with a local host.', starts_at: '2026-12-12T05:00:00Z', ends_at: '2026-12-12T17:00:00Z',
      duration_text: 'Saturday day trip from Kigali', includes: ['Return transport from Kigali', 'King’s Palace entry and Nyanza host', 'Heritage lunch host', 'Translator / culture buddy'],
      interests: ['History', 'Food', 'Photography & content'], languages: ['English', 'Kinyarwanda', 'French'] }),
    pilot({ slug: 'musanze-thousand-hills-weekend', title: 'Musanze Thousand Hills Weekend', theme: 'sura-ahandi', town: 'Musanze', format: 'Walking tour',
      summary: 'Volcano views, the market, coffee, a youth dinner and a morning walk under the hills.', starts_at: '2027-01-09T05:00:00Z', ends_at: '2027-01-10T16:00:00Z',
      duration_text: 'Saturday–Sunday overnight', includes: ['Transport and 1 night stay', 'Meals and Musanze host', 'Youth dinner and content buddy', 'Morning walk before heading back'],
      interests: ['Nature', 'Coffee', 'Walking', 'Food', 'Photography & content'], languages: ['English', 'Kinyarwanda'] }),
  ];
  const stories = trips.map((t, i) => ({
    id: uid(), slug: t.slug, title: t.title, trip_id: t.id, town: t.town, story_date: t.starts_at.slice(0, 10), host_label: 'Host to be confirmed',
    summary: 'Coming soon — first Stories from our pilots.', cover_image: null, photos: [], video_url: '', body: '', included: [], quote: '', quote_by: '',
    status: 'coming_soon', sort_order: i + 1, created_at: now(),
  }));
  const admin = { id: uid(), email: 'muraho@zaniheza.com', full_name: 'ZaNiheza Admin', role: 'admin', profile_done: false, is_public: false, languages: [], interests: [], towns: [], created_at: now() };
  const traveller = { id: uid(), email: 'you@example.com', full_name: 'You (preview)', role: 'traveler', avatar_url: null, profile_done: false, is_public: true,
    languages: [], interests: [], towns: [], created_at: now() };
  return {
    site_settings: [{ id: 1, content: {}, whatsapp_community_url: null, instagram_url: 'https://www.instagram.com/zaniheza_travel', instagram_handle: '@zaniheza_travel', email: 'muraho@zaniheza.com' }],
    trips, stories, trip_private: [], hosts: [], bookings: [], reviews: [], inquiries: [],
    faqs: FAQ_DEFAULTS.map((f, i) => ({ id: uid(), question: f.question, answer: f.answer, sort_order: i + 1, is_published: true, created_at: now() })),
    profiles: [admin, traveller],
    packages: [], departures: [], experiences: [], hotels: [], cars: [], attractions: [],
    _who: { admin: admin.id, traveller: traveller.id },
  };
}

let db;
try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { db = seed(); }
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* full */ } };
export function resetDemo() { db = seed(); session = null; persist(); location.reload(); }

const rowsOf = (table) => {
  if (table === 'public_members') {
    return db.profiles.filter((p) => p.is_public && p.profile_done).map((p) => ({
      id: p.id, first_name: (p.full_name || '').split(' ')[0], avatar_url: p.avatar_url, home_city: p.home_city, country: p.country,
      languages: p.languages, interests: p.interests, towns: p.towns, travel_style: p.travel_style, created_at: p.created_at,
    }));
  }
  return (db[table] ||= []);
};

class Query {
  constructor(table) { Object.assign(this, { table, op: 'select', filters: [], cols: '*', opts: {} }); }
  select(cols = '*', opts = {}) { if (this.op === 'select') { this.cols = cols; this.opts = opts; } else this.returning = true; return this; }
  insert(v) { this.op = 'insert'; this.payload = v; return this; }
  update(v) { this.op = 'update'; this.payload = v; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(k, v) { this.filters.push((r) => r[k] === v); return this; }
  neq(k, v) { this.filters.push((r) => r[k] !== v); return this; }
  in(k, a) { this.filters.push((r) => a.includes(r[k])); return this; }
  gte(k, v) { this.filters.push((r) => r[k] >= v); return this; }
  lte(k, v) { this.filters.push((r) => r[k] <= v); return this; }
  order(k, { ascending = true } = {}) { this.ord = [k, ascending]; return this; }
  limit(n) { this.lim = n; return this; }
  maybeSingle() { this.one = true; return this; }
  single() { this.one = true; return this; }
  then(res, rej) { return Promise.resolve().then(() => this.exec()).then(res, rej); }
  matched() { return rowsOf(this.table).filter((r) => this.filters.every((f) => f(r))); }
  join(rows) {
    const joins = [...this.cols.matchAll(/(\w+):(\w+)\(/g)].map((m) => [m[1], m[2]]);
    return rows.map((r) => {
      const out = { ...r };
      for (const [alias, table] of joins) out[alias] = rowsOf(table).find((x) => x.id === r[`${alias}_id`]) || null;
      return JSON.parse(JSON.stringify(out));
    });
  }
  exec() {
    const t = rowsOf(this.table);
    if (this.op === 'insert') {
      const list = (Array.isArray(this.payload) ? this.payload : [this.payload]).map((p) => ({ id: uid(), created_at: now(), ...p }));
      t.push(...list); persist();
      const data = this.returning ? (this.one ? list[0] : list) : null;
      return { data, error: null };
    }
    if (this.op === 'update') { this.matched().forEach((r) => Object.assign(r, this.payload)); persist(); return { data: null, error: null }; }
    if (this.op === 'delete') { const kill = new Set(this.matched()); db[this.table] = t.filter((r) => !kill.has(r)); persist(); return { data: null, error: null }; }
    let rows = this.matched();
    if (this.opts.head) return { data: null, count: rows.length, error: null };
    if (this.ord) {
      const [k, asc] = this.ord;
      rows = [...rows].sort((a, b) => {
        const x = a[k], y = b[k];
        if (x == null) return 1; if (y == null) return -1;
        const c = typeof x === 'string' ? x.localeCompare(y) : x - y;
        return asc ? c : -c;
      });
    }
    if (this.lim) rows = rows.slice(0, this.lim);
    rows = this.join(rows);
    return { data: this.one ? rows[0] || null : rows, error: null };
  }
}

const listeners = new Set();
let session = null;
const emit = () => listeners.forEach((fn) => fn(session ? 'SIGNED_IN' : 'SIGNED_OUT', session));
export async function demoSignIn(who) {
  const id = who ? db._who[who] : null;
  const p = db.profiles.find((x) => x.id === id);
  session = p ? { user: { id: p.id, email: p.email }, access_token: 'demo' } : null;
  emit();
}

export const isConfigured = true;
export const supabase = {
  from: (table) => new Query(table),
  auth: {
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (fn) => { listeners.add(fn); return { data: { subscription: { unsubscribe: () => listeners.delete(fn) } } }; },
    signInWithOAuth: async () => { await demoSignIn('traveller'); return { error: null }; },
    signInWithOtp: async () => { await demoSignIn('traveller'); return { error: null }; },
    signInWithPassword: async () => { await demoSignIn('admin'); return { error: null }; },
    signOut: async () => { session = null; emit(); return { error: null }; },
    updateUser: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
  },
};

export async function run(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Pretend Stripe: marks the booking paid straight away, then opens the confirmation page
export async function demoCheckout(tripId, seats) {
  if (!session) throw new Error('Please join or sign in to book.');
  const trip = db.trips.find((t) => t.id === tripId);
  if (!trip?.price) throw new Error('The price for this Trip is not confirmed yet.');
  const sid = `demo_${uid()}`;
  db.bookings.push({ id: uid(), created_at: now(), trip_id: trip.id, user_id: session.user.id, name: db.profiles.find((p) => p.id === session.user.id)?.full_name,
    email: session.user.email, seats, unit_amount: trip.price, amount_total: trip.price * seats, currency: trip.currency, status: 'paid', stripe_session_id: sid, paid_at: now() });
  trip.seats_booked += seats;
  persist();
  window.dispatchEvent(new CustomEvent('demo-nav', { detail: `/booking/success?session_id=${sid}` }));
}

export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, 1200 / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => reject(new Error('That file is not an image this browser can read.'));
    img.src = url;
  });
}
