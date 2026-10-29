-- ZaNiheza database. Paste this whole file into Supabase > SQL Editor > New query > Run.
-- Safe to run once on a fresh project.

create extension if not exists pgcrypto;

-- ============ USERS & ROLES ============
-- traveler = public visitor account (optional), advisor = travel consultant, admin = owner
create type user_role as enum ('traveler', 'advisor', 'admin');

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  full_name text,
  role user_role not null default 'traveler',
  created_at timestamptz not null default now()
);

create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create or replace function has_role(roles text[]) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role::text = any(roles));
$$;

-- ============ SITE SETTINGS (logo, hero, contacts) ============
create table site_settings (
  id int primary key default 1 check (id = 1),
  site_name text default 'ZaNiheza',
  logo_url text,
  hero_image_url text,
  hero_title text,
  hero_subtitle text,
  about_text text,
  email text,
  whatsapp text,
  phone text,
  linkedin_url text,
  tiktok_url text,
  instagram_url text,
  updated_at timestamptz default now()
);

-- ============ CATALOG ============
create table experiences (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  tagline text,
  motto text,
  summary text,
  description text,
  highlights jsonb not null default '[]',
  cover_image text,
  gallery text[] not null default '{}',
  sort_order int not null default 0,
  is_published boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now()
);

create table hotels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text,
  stars int,
  description text,
  price_per_night numeric,
  currency text not null default 'USD',
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table cars (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  vehicle_type text,
  seats int,
  with_driver boolean not null default true,
  description text,
  price_per_day numeric,
  currency text not null default 'USD',
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table attractions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  kind text not null default 'attraction'
    check (kind in ('museum', 'attraction', 'activity', 'park', 'cultural')),
  location text,
  description text,
  price numeric,
  currency text not null default 'USD',
  duration_hours numeric,
  images text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- itinerary format: [{ "day": 1, "title": "...", "description": "...", "hotel_id": "uuid|null", "attraction_ids": ["uuid"] }]
create table packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  experience_id uuid references experiences on delete set null,
  title text not null,
  summary text,
  description text,
  duration_days int not null default 1,
  price_from numeric,
  currency text not null default 'USD',
  price_notes text,
  cover_image text,
  gallery text[] not null default '{}',
  includes text[] not null default '{}',
  excludes text[] not null default '{}',
  itinerary jsonb not null default '[]',
  car_id uuid references cars on delete set null,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table departures (
  id uuid primary key default gen_random_uuid(),
  package_id uuid not null references packages on delete cascade,
  start_date date not null,
  seats_total int not null default 12,
  seats_booked int not null default 0,
  price numeric,
  status text not null default 'open' check (status in ('open', 'full', 'closed')),
  created_at timestamptz not null default now()
);

-- ============ INQUIRIES & BOOKING REQUESTS ============
create table inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  kind text not null default 'inquiry' check (kind in ('inquiry', 'booking')),
  full_name text not null,
  email text not null,
  phone text,
  country text,
  package_id uuid references packages on delete set null,
  experience_id uuid references experiences on delete set null,
  departure_id uuid references departures on delete set null,
  travel_date date,
  travelers int default 1,
  budget text,
  message text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'quoted', 'confirmed', 'cancelled')),
  assigned_to uuid references profiles on delete set null,
  notes text
);

-- ============ SECURITY (Row Level Security) ============
alter table profiles enable row level security;
alter table site_settings enable row level security;
alter table experiences enable row level security;
alter table hotels enable row level security;
alter table cars enable row level security;
alter table attractions enable row level security;
alter table packages enable row level security;
alter table departures enable row level security;
alter table inquiries enable row level security;

-- profiles
create policy "read own profile" on profiles for select using (id = auth.uid());
create policy "staff read profiles" on profiles for select using (has_role(array['advisor','admin']));
create policy "admin update profiles" on profiles for update using (has_role(array['admin']));

-- settings: everyone reads, admin edits
create policy "public read settings" on site_settings for select using (true);
create policy "admin edit settings" on site_settings for update using (has_role(array['admin']));

-- catalog: public reads published/active rows; advisors+admins create & edit; only admins delete
create policy "public read experiences" on experiences for select using (is_published or has_role(array['advisor','admin']));
create policy "public read hotels" on hotels for select using (is_active or has_role(array['advisor','admin']));
create policy "public read cars" on cars for select using (is_active or has_role(array['advisor','admin']));
create policy "public read attractions" on attractions for select using (is_active or has_role(array['advisor','admin']));
create policy "public read packages" on packages for select using (is_published or has_role(array['advisor','admin']));
create policy "public read departures" on departures for select using (true);

do $$
declare t text;
begin
  foreach t in array array['experiences','hotels','cars','attractions','packages','departures'] loop
    execute format('create policy "staff insert %1$s" on %1$s for insert with check (has_role(array[''advisor'',''admin'']))', t);
    execute format('create policy "staff update %1$s" on %1$s for update using (has_role(array[''advisor'',''admin'']))', t);
    execute format('create policy "admin delete %1$s" on %1$s for delete using (has_role(array[''admin'']))', t);
  end loop;
end $$;

-- inquiries: anyone can send one (but cannot read any); staff manage them
create policy "anyone can send inquiry" on inquiries for insert
  with check (status = 'new' and assigned_to is null and notes is null);
create policy "staff read inquiries" on inquiries for select using (has_role(array['advisor','admin']));
create policy "staff update inquiries" on inquiries for update using (has_role(array['advisor','admin']));
create policy "admin delete inquiries" on inquiries for delete using (has_role(array['admin']));

-- ============ IMAGE STORAGE ============
insert into storage.buckets (id, name, public) values ('media', 'media', true)
  on conflict (id) do nothing;

create policy "media public read" on storage.objects for select using (bucket_id = 'media');
create policy "media staff upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and has_role(array['advisor','admin']));
create policy "media staff update" on storage.objects for update to authenticated
  using (bucket_id = 'media' and has_role(array['advisor','admin']));
create policy "media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and has_role(array['admin']));

-- ============ STARTING CONTENT (from the brochure) ============
insert into site_settings (id, hero_title, hero_subtitle, about_text, email, whatsapp, phone, linkedin_url, tiktok_url)
values (
  1,
  'Rwanda, through the eyes of its people',
  'Cultural and experiential journeys shaped by local communities, history, creativity and nature.',
  'ZaNiheza is a Rwandan-based cultural and experiential travel company curating meaningful journeys that connect travelers to the heart of the country. We go beyond sightseeing to offer immersive experiences shaped by local communities, history, creativity and nature. Every journey with ZaNiheza is designed to be authentic, respectful and unforgettable.',
  'muraho@zaniheza.com',
  '250787426884',
  '+250 787 426 884',
  'https://www.linkedin.com/company/zanihezatravel',
  'https://www.tiktok.com/@zanihezatravel'
);

insert into experiences (slug, name, tagline, motto, summary, description, highlights, sort_order) values
('kigali-yacu', 'Kigali Yacu', 'A fresh take on Africa''s cleanest city', 'Kigali Yacu is where tradition meets innovation',
 'Experience Kigali through the eyes of its people: art, culture, history and everyday life in one curated city experience.',
 'Kigali Yacu invites you to experience Kigali through the eyes of its people. This curated city experience blends art, culture, history, and everyday life, revealing a capital that is vibrant, welcoming, and deeply inspiring.',
 '[{"title":"Imigongo art","text":"Discover Rwanda''s unique traditional art form made from cow dung, natural pigments and bold geometric designs."},
   {"title":"Local storytelling & cultural encounters","text":"Hear Kigali''s story from the people who live it."},
   {"title":"Hidden gems & creative spaces","text":"Studios, markets and corners that define modern Kigali."}]', 1),
('sura-ahandi', 'Sura Ahandi', 'Step outside Kigali. Feel Rwanda', 'Perfect for travelers seeking authenticity, nature and connection',
 'Go beyond the capital to Rwanda''s countryside, towns and natural landscapes, slowing down to discover its quieter beauty.',
 'Sura Ahandi takes you beyond the capital to explore Rwanda''s countryside, towns, and natural landscapes. These experiences are about slowing down, connecting, and discovering Rwanda''s quieter beauty.',
 '[{"title":"Scenic rural escapes","text":"Hills, lakes and villages at an unhurried pace."},
   {"title":"Cultural villages & community visits","text":"Time with the communities who keep Rwanda''s traditions alive."},
   {"title":"Coffee farms & local craftsmanship","text":"From cherry to cup, and the hands behind Rwandan crafts."}]', 2),
('umwimerere', 'Umwimerere Experience', 'Rwanda''s uniquely wild encounters', 'Rare. Powerful. Unforgettable.',
 'Rwanda''s most extraordinary natural encounters, where conservation, wildlife and landscape come together.',
 'Umwimerere means something exceptional, rare, and unmatched. This experience is designed for travelers seeking Rwanda''s most extraordinary natural encounters, where conservation, wildlife, and landscape come together in unforgettable ways. From mist-covered volcanoes to open savannahs, Umwimerere showcases Rwanda''s unique position as a country where intimate wildlife experiences meet world-class protection.',
 '[{"title":"Gorilla trekking","text":"A once-in-a-lifetime encounter in Volcanoes National Park."},
   {"title":"Big Five safari","text":"Explore Akagera National Park in search of lion, elephant, rhino, leopard and buffalo."},
   {"title":"Hot air balloon safari","text":"A breathtaking sunrise flight over Akagera''s savannah."}]', 3),
('umwami', 'Umwami Experience', 'Discover Rwanda before colonial history', 'Umwami is history brought to life',
 'A deep cultural journey into Rwanda''s pre-colonial heritage, leadership and identity.',
 'Umwami is a deep cultural journey into Rwanda''s pre-colonial heritage, leadership, and identity. This experience reconnects travelers with the kingdom that shaped Rwanda''s values and traditions.',
 '[{"title":"King''s Palace Museum","text":"The royal residence at Nyanza, rebuilt in the traditional style."},
   {"title":"Inyambo cows","text":"The majestic royal cows, symbols of power and pride."},
   {"title":"Storytelling","text":"Rwanda''s monarchy, culture and governance, told by those who keep the stories."}]', 4);

insert into attractions (name, kind, location, description) values
('King''s Palace Museum', 'museum', 'Nyanza', 'Traditional royal residence and the home of the Inyambo cows.'),
('Gorilla trekking', 'park', 'Volcanoes National Park, Musanze', 'Guided trek to a habituated mountain gorilla family. Permit required.'),
('Akagera game drive', 'park', 'Akagera National Park', 'Full-day Big Five game drive across savannah, lakes and wetlands.'),
('Hot air balloon flight', 'activity', 'Akagera National Park', 'Sunrise balloon flight over the savannah.'),
('Imigongo art workshop', 'cultural', 'Kigali', 'Hands-on session making Imigongo geometric art.'),
('Coffee farm visit', 'cultural', 'Huye / Lake Kivu', 'Walk the farm, process the cherries and taste the coffee.');

insert into packages (slug, experience_id, title, summary, duration_days, includes, excludes, is_published, is_featured, itinerary)
select 'kigali-yacu-city-day', id, 'Kigali Yacu city day',
  'A full day in Kigali: Imigongo art, local storytelling and the creative spaces of the capital.',
  1, array['Private guide','Transport in Kigali','Imigongo workshop','Lunch'], array['Tips','Personal expenses'],
  true, true,
  '[{"day":1,"title":"Kigali through its people","description":"Morning Imigongo workshop, lunch at a local spot, afternoon storytelling walk and creative spaces.","hotel_id":null,"attraction_ids":[]}]'::jsonb
from experiences where slug = 'kigali-yacu';

-- AFTER you create your own login (Authentication > Users > Add user), make yourself admin:
-- update profiles set role = 'admin' where email = 'muraho@zaniheza.com';
