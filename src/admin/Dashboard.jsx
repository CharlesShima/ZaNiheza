import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate, formatPrice } from '../lib/format';
import { useAuth } from '../lib/auth';

async function count(table, apply = (q) => q) {
  const { count: n } = await apply(supabase.from(table).select('id', { count: 'exact', head: true }));
  return n ?? 0;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [s, setS] = useState({});
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    Promise.all([
      count('hosts', (q) => q.eq('status', 'pending')),
      count('trips', (q) => q.eq('status', 'pending')),
      count('bookings', (q) => q.eq('status', 'paid')),
      count('inquiries', (q) => q.eq('status', 'new')),
      count('public_members'),
    ]).then(([hosts, trips, paid, inquiries, members]) => setS({ hosts, trips, paid, inquiries, members }))
      .catch(() => setS({}));
    supabase.from('bookings').select('id, name, email, seats, amount_total, currency, status, created_at, trip:trips(title)')
      .order('created_at', { ascending: false }).limit(8).then(({ data }) => setRecent(data || []));
  }, []);

  const n = (v) => (v ?? '…');
  return (
    <div>
      <div className="admin-head"><h1>Muraho{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1></div>
      <div className="stat-row">
        <Link to="/admin/hosts" className="stat"><strong>{n(s.hosts)}</strong><span>host applications to vet</span></Link>
        <Link to="/admin/trips" className="stat"><strong>{n(s.trips)}</strong><span>Trips waiting for approval</span></Link>
        <Link to="/admin/bookings" className="stat"><strong>{n(s.paid)}</strong><span>paid bookings</span></Link>
        <div className="stat"><strong>{n(s.members)}</strong><span>public member profiles</span></div>
        <Link to="/admin/inquiries" className="stat"><strong>{n(s.inquiries)}</strong><span>new private enquiries</span></Link>
      </div>
      <h2 className="admin-sub">Latest bookings</h2>
      {recent.length === 0 ? <p className="muted">No bookings yet. They appear here when travellers pay with Stripe.</p> : (
        <ul className="recent">
          {recent.map((r) => (
            <li key={r.id}>
              <span className={`badge ${r.status === 'paid' ? 'badge--booking' : ''}`}>{r.status}</span>
              <strong>{r.name || r.email}</strong>
              <span>{r.trip?.title}</span>
              <span>{r.seats} seat{r.seats > 1 ? 's' : ''}, {formatPrice(r.amount_total, r.currency)}</span>
              <span className="muted">{formatDate(r.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
      <h2 className="admin-sub">Quick actions</h2>
      <div className="quick">
        <Link className="btn btn--navy" to="/admin/trips">Approve or price Trips</Link>
        <Link className="btn btn--outline" to="/admin/hosts">Vet hosts</Link>
        <Link className="btn btn--outline" to="/admin/stories">Publish a Story</Link>
        <Link className="btn btn--outline" to="/admin/settings">Edit page text</Link>
      </div>
    </div>
  );
}
