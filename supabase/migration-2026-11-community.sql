-- ZaNiheza community platform: Trips, Hosts, Bookings (Stripe), Stories, Reviews, FAQ, member profiles.
-- Run ONCE in Supabase > SQL Editor > New query > Run. Safe to run on top of schema.sql.
-- It keeps every existing table (packages, hotels, inquiries...) so nothing you added is lost.

-- ============ 1. MEMBER PROFILES ============
alter table profiles
  add column if not exists avatar_url text,
  add column if not exists home_city text,
  add column if not exists country text,
  add column if not exists languages text[] not null default '{}',
  add column if not exists interests text[] not null default '{}',
  add column if not exists towns text[] not null default '{}',
  add column if not exists travel_style text,
  add column if not exists rwanda_from date,
  add column if not exists rwanda_to date,
  add column if not exists bio text,
  add column if not exists is_public boolean not null default true,
  add column if not exists buddy_matching boolean not null default false,
  add column if not exists profile_done boolean not null default false;

-- New sign-ups (Google or email) get a profile with their name and Google photo
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, email, full_name, avatar_url)
  values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop policy if exists "update own profile" on profiles;
create policy "update own profile" on profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- Members can never change their own role (only an admin, or you in the SQL editor)
create or replace function protect_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not has_role(array['admin']) then
    new.role := old.role;
  end if;
  return new;
end $$;
drop trigger if exists protect_profile_role on profiles;
create trigger protect_profile_role before update on profiles for each row execute function protect_profile_role();

-- Public member cards: first name, photo, city and interests only. Never email or role.
create or replace view public_members as
  select id, split_part(coalesce(full_name, ''), ' ', 1) as first_name, avatar_url, home_city, country,
         languages, interests, towns, travel_style, created_at
  from profiles
  where is_public and profile_done;
grant select on public_members to anon, authenticated;

-- ============ 2. HOSTS ============
create table if not exists hosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references profiles on delete set null,
  name text not null,
  photo_url text,
  town text,
  bio text,
  languages text[] not null default '{}',
  formats text[] not null default '{}',
  three_places text[] not null default '{}',
  availability text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'paused', 'rejected')),
  admin_notes text,
  created_at timestamptz not null default now()
);
alter table hosts enable row level security;
create policy "read approved hosts" on hosts for select
  using (status = 'approved' or user_id = auth.uid() or has_role(array['advisor','admin']));
create policy "member applies to host" on hosts for insert
  with check (user_id = auth.uid() and status = 'pending' and admin_notes is null);
create policy "host edits own profile" on hosts for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "staff manage hosts" on hosts for all
  using (has_role(array['advisor','admin'])) with check (has_role(array['advisor','admin']));

create or replace function protect_host_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is not null and not has_role(array['advisor','admin']) then
    new.status := old.status;
    new.admin_notes := old.admin_notes;
    new.user_id := old.user_id;
  end if;
  return new;
end $$;
drop trigger if exists protect_host_status on hosts;
create trigger protect_host_status before update on hosts for each row execute function protect_host_status();

-- ============ 3. TRIPS ============
create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  theme text check (theme in ('kigali-yacu', 'sura-ahandi', 'umwami', 'umwimerere')),
  town text not null,
  format text,
  summary text,
  description text,
  starts_at timestamptz,
  ends_at timestamptz,
  duration_text text,
  meeting_point text,
  capacity int not null default 15 check (capacity between 1 and 15),
  seats_booked int not null default 0,
  includes text[] not null default '{}',
  difficulty text default 'Easy',
  interests text[] not null default '{}',
  languages text[] not null default '{English}',
  price_suggestion numeric,
  price numeric,
  currency text not null default 'USD',
  cover_image text,
  gallery text[] not null default '{}',
  host_id uuid references hosts on delete set null,
  host_label text default 'Host to be confirmed',
  status text not null default 'pending' check (status in ('draft', 'pending', 'approved', 'paused', 'completed', 'rejected')),
  is_pilot boolean not null default false,
  host_payout text not null default 'not_due' check (host_payout in ('not_due', 'due', 'paid')),
  submitted_by uuid references profiles on delete set null,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table trips enable row level security;
create policy "read live trips" on trips for select
  using (status in ('approved', 'completed') or submitted_by = auth.uid() or has_role(array['advisor','admin']));
create policy "approved host proposes trip" on trips for insert
  with check (
    submitted_by = auth.uid() and status = 'pending' and price is null and is_pilot = false and seats_booked = 0
    and exists (select 1 from hosts h where h.id = host_id and h.user_id = auth.uid() and h.status = 'approved')
  );
create policy "staff manage trips" on trips for all
  using (has_role(array['advisor','admin'])) with check (has_role(array['advisor','admin']));

-- Trip chat link: only staff, and travellers with a paid booking, can read it
create table if not exists trip_private (
  trip_id uuid primary key references trips on delete cascade,
  chat_link text,
  internal_notes text
);
alter table trip_private enable row level security;
create policy "staff manage trip_private" on trip_private for all
  using (has_role(array['advisor','admin'])) with check (has_role(array['advisor','admin']));

-- ============ 4. BOOKINGS (created only by the Stripe checkout function) ============
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  trip_id uuid not null references trips on delete restrict,
  user_id uuid references profiles on delete set null,
  name text,
  email text,
  seats int not null check (seats between 1 and 15),
  unit_amount numeric,
  amount_total numeric,
  currency text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  stripe_session_id text unique,
  stripe_payment_intent text,
  paid_at timestamptz
);
alter table bookings enable row level security;
create policy "read own bookings" on bookings for select using (user_id = auth.uid() or has_role(array['advisor','admin']));
create policy "staff update bookings" on bookings for update using (has_role(array['advisor','admin']));

create policy "paid travellers read chat link" on trip_private for select
  using (exists (select 1 from bookings b where b.trip_id = trip_private.trip_id and b.user_id = auth.uid() and b.status = 'paid'));

-- Called by the Stripe webhook only: marks a booking paid and takes the seats
create or replace function confirm_booking(p_session text, p_payment_intent text, p_amount numeric)
returns void language plpgsql security definer set search_path = public as $$
declare b bookings;
begin
  select * into b from bookings where stripe_session_id = p_session for update;
  if not found or b.status = 'paid' then return; end if;
  update bookings
    set status = 'paid', paid_at = now(), stripe_payment_intent = p_payment_intent,
        amount_total = coalesce(p_amount, amount_total)
    where id = b.id;
  update trips set seats_booked = seats_booked + b.seats where id = b.trip_id;
end $$;
revoke execute on function confirm_booking(text, text, numeric) from public, anon, authenticated;
grant execute on function confirm_booking(text, text, numeric) to service_role;

-- ============ 5. REVIEWS (only travellers who went) ============
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  trip_id uuid not null references trips on delete cascade,
  host_id uuid references hosts on delete set null,
  user_id uuid references profiles on delete set null,
  reviewer_name text,
  rating int not null check (rating between 1 and 5),
  body text,
  photos text[] not null default '{}',
  status text not null default 'published' check (status in ('published', 'hidden')),
  unique (trip_id, user_id)
);
alter table reviews enable row level security;
create policy "read published reviews" on reviews for select
  using (status = 'published' or user_id = auth.uid() or has_role(array['advisor','admin']));
create policy "travellers who went can review" on reviews for insert
  with check (
    user_id = auth.uid() and status = 'published'
    and exists (
      select 1 from bookings b join trips t on t.id = b.trip_id
      where b.trip_id = reviews.trip_id and b.user_id = auth.uid() and b.status = 'paid' and t.starts_at < now()
    )
  );
create policy "staff moderate reviews" on reviews for update using (has_role(array['advisor','admin']));
create policy "admin delete reviews" on reviews for delete using (has_role(array['admin']));

create or replace function review_host_from_trip() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.host_id := (select host_id from trips where id = new.trip_id);
  return new;
end $$;
drop trigger if exists review_host_from_trip on reviews;
create trigger review_host_from_trip before insert on reviews for each row execute function review_host_from_trip();

-- ============ 6. STORIES ============
create table if not exists stories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  trip_id uuid references trips on delete set null,
  town text,
  story_date date,
  host_label text default 'Host to be confirmed',
  summary text,
  cover_image text,
  photos text[] not null default '{}',
  video_url text,
  body text,
  included text[] not null default '{}',
  quote text,
  quote_by text,
  status text not null default 'coming_soon' check (status in ('coming_soon', 'published', 'hidden')),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
alter table stories enable row level security;
create policy "read stories" on stories for select using (status in ('coming_soon', 'published') or has_role(array['advisor','admin']));
create policy "staff manage stories" on stories for all
  using (has_role(array['advisor','admin'])) with check (has_role(array['advisor','admin']));

-- ============ 7. FAQ ============
create table if not exists faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);
alter table faqs enable row level security;
create policy "read faqs" on faqs for select using (is_published or has_role(array['advisor','admin']));
create policy "staff manage faqs" on faqs for all
  using (has_role(array['advisor','admin'])) with check (has_role(array['advisor','admin']));

-- ============ 8. SITE SETTINGS & PAGE TEXT ============
alter table site_settings
  add column if not exists whatsapp_community_url text,
  add column if not exists instagram_handle text default '@zaniheza_travel',
  add column if not exists content jsonb not null default '{}';

update site_settings set
  hero_title = 'Africa’s Friendliest Travel Community',
  hero_subtitle = 'Youth-hosted Trips, launching first in Rwanda. Lunch, tours, translation & content — with local young people who love their town. Kigali + small towns first, Africa from there.',
  instagram_url = 'https://www.instagram.com/zaniheza_travel',
  instagram_handle = '@zaniheza_travel',
  hero_image_url = null
where id = 1;

-- ============ 9. MEMBER PHOTO UPLOADS ============
-- Members and hosts may upload into media/members/<their id>/ only
drop policy if exists "members upload own media" on storage.objects;
create policy "members upload own media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = 'members' and (storage.foldername(name))[2] = auth.uid()::text);

-- ============ 10. STARTING CONTENT: the 3 real pilots (prices and hosts TBC) ============
insert into trips (slug, title, theme, town, format, summary, starts_at, ends_at, duration_text, meeting_point, capacity, includes, interests, languages, status, is_pilot, host_label)
values
('kigali-yacu-night', 'Kigali Yacu Night', 'kigali-yacu', 'Kigali', 'Walking tour',
 'An evening walk and a youth-hosted dinner: the Kigali locals actually live.',
 '2026-12-05 17:00+02', '2026-12-05 21:30+02', 'Saturday evening', 'Confirmed in the community', 15,
 array['Evening walk with a Kigali host', 'Dinner hosted by a local youth host', 'Content buddy for photos & Stories', 'Trip chat link after booking'],
 array['Food', 'Walking', 'Photography & content', 'Music'], array['English', 'Kinyarwanda'], 'approved', true, 'Host to be confirmed'),
('nyanza-small-town-saturday', 'Nyanza Small-Town Saturday', 'umwami', 'Nyanza', 'Walking tour',
 'King’s Palace Museum, the Inyambo cows and a heritage lunch with a local host.',
 '2026-12-12 07:00+02', '2026-12-12 19:00+02', 'Saturday day trip from Kigali', 'Confirmed in the community', 15,
 array['Return transport from Kigali', 'King’s Palace entry and Nyanza host', 'Heritage lunch host', 'Translator / culture buddy'],
 array['History', 'Food', 'Photography & content'], array['English', 'Kinyarwanda', 'French'], 'approved', true, 'Host to be confirmed'),
('musanze-thousand-hills-weekend', 'Musanze Thousand Hills Weekend', 'sura-ahandi', 'Musanze', 'Walking tour',
 'Volcano views, the market, coffee, a youth dinner and a morning walk under the hills.',
 '2027-01-09 07:00+02', '2027-01-10 18:00+02', 'Saturday–Sunday overnight', 'Confirmed in the community', 15,
 array['Transport and 1 night stay', 'Meals and Musanze host', 'Youth dinner and content buddy', 'Morning walk before heading back'],
 array['Nature', 'Coffee', 'Walking', 'Food', 'Photography & content'], array['English', 'Kinyarwanda'], 'approved', true, 'Host to be confirmed')
on conflict (slug) do nothing;

insert into stories (slug, title, town, story_date, status, sort_order, summary, trip_id)
select s.slug, s.title, s.town, s.d::date, 'coming_soon', s.o, 'Coming soon — first Stories from our pilots.', t.id
from (values
  ('kigali-yacu-night', 'Kigali Yacu Night', 'Kigali', '2026-12-05', 1),
  ('nyanza-small-town-saturday', 'Nyanza Small-Town Saturday', 'Nyanza', '2026-12-12', 2),
  ('musanze-thousand-hills-weekend', 'Musanze Thousand Hills Weekend', 'Musanze', '2027-01-09', 3)
) as s(slug, title, town, d, o)
left join trips t on t.slug = s.slug
on conflict (slug) do nothing;

insert into faqs (question, answer, sort_order)
select * from (values
  ('Where are you launching?', 'ZaNiheza is Africa’s Friendliest Travel Community, launching first in Rwanda for hosting: Kigali, Nyanza and Musanze first, then across Africa.', 1),
  ('How do I book?', 'On this site, instantly. Open a Trip, choose your seats and check out. No messages needed.', 2),
  ('How do I join the community?', 'Tap Join now and sign in with Google (or email). Then join our WhatsApp Community from the Community section.', 3),
  ('How do I host?', 'Join now, create a host profile, get vetted by ZaNiheza, then add your Trip.', 4),
  ('Are hosts vetted?', 'Yes. Every host sends an application, has a 15-minute call or coffee with us, and co-hosts their first Trip with ZaNiheza.', 5),
  ('How do I pay?', 'Securely with Stripe, right here on the site. (Our Stripe connection is being finalised.)', 6),
  ('Can I come alone?', 'Yes. Groups are small, 15 people at most, and you can opt in to travel-buddy matching.', 7),
  ('Do I need Kinyarwanda?', 'No. Hosts help with translation.', 8),
  ('What about gorillas and the Umwimerere Experience?', 'That’s our private, premium arm. Ask on the site for a full bespoke price.', 9),
  ('What if I DM on Instagram?', 'DMs are backup only. The site is the fastest way to book or host.', 10)
) as f(q, a, o)
where not exists (select 1 from faqs);

-- AFTER running this, in Supabase go to Authentication > Sign In / Providers and turn ON
-- "Allow new users to sign up", then enable the Google provider (see README).
