-- ZaNiheza: host dashboard bookings. Run once in Supabase > SQL Editor (after migration-2026-11-community.sql).
-- Hosts see who booked their Trips: first name, seats and status only. Never email or payment details.
create or replace view host_trip_bookings as
  select b.id, b.trip_id, t.title as trip_title, t.starts_at,
         split_part(coalesce(p.full_name, b.name, ''), ' ', 1) as first_name,
         b.seats, b.status, b.created_at
  from bookings b
  join trips t on t.id = b.trip_id
  join hosts h on h.id = t.host_id
  left join profiles p on p.id = b.user_id
  where h.user_id = auth.uid() and b.status in ('paid', 'refunded');
grant select on host_trip_bookings to authenticated;
