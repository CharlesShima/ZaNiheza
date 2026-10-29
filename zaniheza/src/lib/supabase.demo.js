// Preview backend: an in-browser imitation of Supabase with sample data.
// Used only by `npm run build:demo`. Changes are kept in this browser.
import { FALLBACK_EXPERIENCES } from './fallback';

const KEY = 'zaniheza-demo-v1';
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16)));
const now = () => new Date().toISOString();
const inDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);

function seed() {
  const exp = FALLBACK_EXPERIENCES.map((e, i) => ({ ...e, id: uid(), cover_image: null, gallery: [], sort_order: i + 1, is_published: true, created_at: now() }));
  const E = Object.fromEntries(exp.map((e) => [e.slug, e.id]));
  const hotels = [
    ['Kigali boutique hotel', 'Kigali', 4, 160], ['Musanze mountain lodge', 'Musanze', 4, 240],
    ['Akagera lakeside camp', 'Akagera National Park', 3, 210], ['Nyanza heritage guesthouse', 'Nyanza', 3, 70],
  ].map(([name, location, stars, price]) => ({ id: uid(), name, location, stars, price_per_night: price, currency: 'USD', description: 'Sample hotel for the preview.', images: [], is_active: true, created_at: now() }));
  const cars = [
    ['Land Cruiser with pop-up roof', '4x4 safari', 6, 150], ['Toyota Hiace minivan', 'Minivan', 12, 120],
  ].map(([name, vehicle_type, seats, price]) => ({ id: uid(), name, vehicle_type, seats, price_per_day: price, currency: 'USD', with_driver: true, description: 'Sample vehicle with driver-guide.', images: [], is_active: true, created_at: now() }));
  const attr = [
    ["King's Palace Museum", 'museum', 'Nyanza', 15], ['Gorilla trekking permit', 'park', 'Volcanoes National Park', 1500],
    ['Akagera game drive', 'park', 'Akagera National Park', 100], ['Hot air balloon flight', 'activity', 'Akagera National Park', 400],
    ['Imigongo art workshop', 'cultural', 'Kigali', 40], ['Coffee farm visit', 'cultural', 'Huye', 35],
  ].map(([name, kind, location, price]) => ({ id: uid(), name, kind, location, price, currency: 'USD', duration_hours: null, description: '', images: [], is_active: true, created_at: now() }));
  const A = Object.fromEntries(attr.map((a) => [a.name, a.id]));
  const pk = (o) => ({ id: uid(), gallery: [], cover_image: null, excludes: ['International flights', 'Tips', 'Personal expenses'], is_published: true, is_featured: true, price_notes: 'Sample price for the preview.', car_id: null, seo_title: '', seo_description: '', currency: 'USD', created_at: now(), updated_at: now(), ...o });
  const packages = [
    pk({ slug: 'kigali-yacu-city-day', experience_id: E['kigali-yacu'], title: 'Kigali Yacu city day', duration_days: 1, price_from: 120,
      summary: 'A full day in Kigali: Imigongo art, local storytelling and the creative spaces of the capital.',
      description: 'Spend a day with Kigali the way locals know it. Paint your own Imigongo piece, meet the storytellers and makers, and find the corners of the city most visitors walk past.',
      includes: ['Private guide', 'Transport in Kigali', 'Imigongo workshop', 'Lunch'], car_id: cars[1].id,
      itinerary: [{ day: 1, title: 'Kigali through its people', description: 'Morning Imigongo workshop, lunch at a local spot, afternoon storytelling walk and creative spaces.', hotel_id: null, attraction_ids: [A['Imigongo art workshop']] }] }),
    pk({ slug: 'gorillas-and-big-five', experience_id: E.umwimerere, title: 'Gorillas and the Big Five', duration_days: 4, price_from: 3450,
      summary: 'Mountain gorillas in Volcanoes National Park, then a game drive and sunrise balloon flight over Akagera.',
      description: "Rwanda's two great wildlife encounters in one trip, with a comfortable 4x4 and the same driver-guide throughout.",
      includes: ['Gorilla permit', 'Park fees', '4x4 with driver-guide', '3 nights accommodation', 'Meals as listed'], car_id: cars[0].id,
      itinerary: [
        { day: 1, title: 'Kigali to Musanze', description: 'Scenic drive north to the foot of the Virunga volcanoes.', hotel_id: hotels[1].id, attraction_ids: [] },
        { day: 2, title: 'Gorilla trekking', description: 'Trek to a habituated gorilla family and spend an hour in their company.', hotel_id: hotels[1].id, attraction_ids: [A['Gorilla trekking permit']] },
        { day: 3, title: 'Across to Akagera', description: 'Drive east to the savannah with an afternoon game drive.', hotel_id: hotels[2].id, attraction_ids: [A['Akagera game drive']] },
        { day: 4, title: 'Sunrise balloon and return', description: 'Balloon flight at dawn, then back to Kigali.', hotel_id: null, attraction_ids: [A['Hot air balloon flight']] },
      ] }),
    pk({ slug: 'umwami-royal-heritage', experience_id: E.umwami, title: 'Umwami royal heritage', duration_days: 2, price_from: 480, is_featured: true,
      summary: "Nyanza's royal palace, the Inyambo cows and the stories of Rwanda's kingdom.",
      description: "Travel south to the seat of Rwanda's monarchy and hear its history from those who keep the stories.",
      includes: ['Guide', 'Transport', 'Museum entry', '1 night accommodation'], car_id: cars[1].id,
      itinerary: [
        { day: 1, title: 'Kigali to Nyanza', description: "Visit the King's Palace Museum and meet the Inyambo cows.", hotel_id: hotels[3].id, attraction_ids: [A["King's Palace Museum"]] },
        { day: 2, title: 'Stories and return', description: 'Morning storytelling session on monarchy, culture and governance, then back to Kigali.', hotel_id: null, attraction_ids: [] },
      ] }),
  ];
  const departures = [
    { package_id: packages[1].id, start_date: inDays(21), seats_total: 8, seats_booked: 5, price: null, status: 'open' },
    { package_id: packages[1].id, start_date: inDays(49), seats_total: 8, seats_booked: 8, price: null, status: 'full' },
    { package_id: packages[0].id, start_date: inDays(10), seats_total: 12, seats_booked: 3, price: null, status: 'open' },
  ].map((d) => ({ id: uid(), created_at: now(), ...d }));
  const admin = { id: uid(), email: 'muraho@zaniheza.com', full_name: 'ZaNiheza Admin', role: 'admin', created_at: now() };
  const advisor = { id: uid(), email: 'advisor@zaniheza.com', full_name: 'Aline Uwase', role: 'advisor', created_at: now() };
  const inquiries = [
    { kind: 'booking', full_name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1 555 0100', country: 'United States', package_id: packages[1].id, departure_id: departures[0].id, travel_date: departures[0].start_date, travelers: 2, budget: '$1,500 to $3,000', message: 'Honeymoon! Can we upgrade the lodge in Musanze?', status: 'new' },
    { kind: 'inquiry', full_name: 'Jean-Paul Mugisha', email: 'jp@example.com', phone: '+250 788 000 000', country: 'Rwanda', experience_id: E['kigali-yacu'], travelers: 15, budget: 'Not sure yet', message: 'Team retreat for 15 colleagues in March.', status: 'contacted', assigned_to: advisor.id, notes: 'Called, sending options Friday.' },
    { kind: 'inquiry', full_name: 'Emma Clarke', email: 'emma@example.com', country: 'United Kingdom', travelers: 4, budget: '$500 to $1,500', message: 'Family reunion, two grandparents, gentle activities please.', status: 'quoted' },
  ].map((r, i) => ({ id: uid(), created_at: new Date(Date.now() - i * 864e5 * 2).toISOString(), phone: null, package_id: null, experience_id: null, departure_id: null, travel_date: null, assigned_to: null, notes: null, ...r }));
  return {
    site_settings: [{ id: 1, site_name: 'ZaNiheza', logo_url: null, hero_image_url: null,
      hero_title: 'Rwanda, through the eyes of its people',
      hero_subtitle: 'Cultural and experiential journeys shaped by local communities, history, creativity and nature.',
      about_text: 'ZaNiheza is a Rwandan-based cultural and experiential travel company curating meaningful journeys that connect travelers to the heart of the country. We go beyond sightseeing to offer immersive experiences shaped by local communities, history, creativity and nature. Every journey with ZaNiheza is designed to be authentic, respectful and unforgettable.',
      email: 'muraho@zaniheza.com', whatsapp: '250787426884', phone: '+250 787 426 884',
      linkedin_url: 'https://www.linkedin.com/company/zanihezatravel', tiktok_url: 'https://www.tiktok.com/@zanihezatravel', instagram_url: null }],
    experiences: exp, hotels, cars, attractions: attr, packages, departures, inquiries, profiles: [admin, advisor],
  };
}

let db;
try { db = JSON.parse(localStorage.getItem(KEY)) || seed(); } catch { db = seed(); }
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch { /* storage full or blocked */ } };
export function resetDemo() { db = seed(); persist(); location.reload(); }

const DEFAULTS = { inquiries: { status: 'new', kind: 'inquiry' }, departures: { seats_booked: 0, status: 'open' } };

class Query {
  constructor(table) { Object.assign(this, { table, op: 'select', filters: [], cols: '*', opts: {} }); }
  select(cols = '*', opts = {}) { if (this.op === 'select') { this.cols = cols; this.opts = opts; } return this; }
  insert(v) { this.op = 'insert'; this.payload = v; return this; }
  update(v) { this.op = 'update'; this.payload = v; return this; }
  delete() { this.op = 'delete'; return this; }
  eq(k, v) { this.filters.push((r) => r[k] === v); return this; }
  neq(k, v) { this.filters.push((r) => r[k] !== v); return this; }
  in(k, a) { this.filters.push((r) => a.includes(r[k])); return this; }
  gte(k, v) { this.filters.push((r) => r[k] >= v); return this; }
  order(k, { ascending = true } = {}) { this.ord = [k, ascending]; return this; }
  limit(n) { this.lim = n; return this; }
  maybeSingle() { this.single = true; return this; }
  then(res, rej) { return Promise.resolve().then(() => this.exec()).then(res, rej); }
  rows() { return (db[this.table] ||= []).filter((r) => this.filters.every((f) => f(r))); }
  exec() {
    const t = db[this.table] ||= [];
    if (this.op === 'insert') {
      const list = (Array.isArray(this.payload) ? this.payload : [this.payload])
        .map((p) => ({ id: uid(), created_at: now(), ...(DEFAULTS[this.table] || {}), ...p }));
      t.push(...list); persist(); return { data: null, error: null };
    }
    if (this.op === 'update') { this.rows().forEach((r) => Object.assign(r, this.payload)); persist(); return { data: null, error: null }; }
    if (this.op === 'delete') { const kill = new Set(this.rows()); db[this.table] = t.filter((r) => !kill.has(r)); persist(); return { data: null, error: null }; }
    let rows = this.rows();
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
    const joins = [...this.cols.matchAll(/(\w+):(\w+)\(/g)].map((m) => [m[1], m[2]]);
    rows = rows.map((r) => {
      const out = { ...r };
      for (const [alias, table] of joins) out[alias] = (db[table] || []).find((x) => x.id === r[`${alias}_id`]) || null;
      return JSON.parse(JSON.stringify(out));
    });
    return { data: this.single ? rows[0] || null : rows, error: null };
  }
}

const listeners = new Set();
let session = { user: { id: db.profiles.find((p) => p.role === 'admin').id, email: 'muraho@zaniheza.com' } };
const emit = () => listeners.forEach((fn) => fn('SIGNED_IN', session));

export const isConfigured = true;
export const supabase = {
  from: (table) => new Query(table),
  auth: {
    getSession: async () => ({ data: { session } }),
    onAuthStateChange: (fn) => { listeners.add(fn); return { data: { subscription: { unsubscribe: () => listeners.delete(fn) } } }; },
    signInWithPassword: async () => { session = { user: { id: db.profiles.find((p) => p.role === 'admin').id, email: 'muraho@zaniheza.com' } }; emit(); return { error: null }; },
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

export function uploadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      // shrink so the preview can remember it in this browser
      const scale = Math.min(1, 1400 / img.width);
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(file.type === 'image/png' ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => reject(new Error('That file is not an image this browser can read.'));
    img.src = url;
  });
}
