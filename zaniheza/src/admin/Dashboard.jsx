import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { formatDate } from '../lib/format';
import { useAuth } from '../lib/auth';

async function count(table, apply = (q) => q) {
  const { count: n } = await apply(supabase.from(table).select('id', { count: 'exact', head: true }));
  return n ?? 0;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      count('inquiries', (q) => q.eq('status', 'new')),
      count('inquiries', (q) => q.eq('status', 'confirmed')),
      count('packages', (q) => q.eq('is_published', true)),
      count('departures', (q) => q.gte('start_date', today).eq('status', 'open')),
    ]).then(([newInq, confirmed, packages, departures]) => setStats({ newInq, confirmed, packages, departures }));
    supabase.from('inquiries').select('id, full_name, kind, status, created_at, package:packages(title)')
      .order('created_at', { ascending: false }).limit(6).then(({ data }) => setRecent(data || []));
  }, []);

  const s = stats || {};
  return (
    <div>
      <div className="admin-head"><h1>Muraho{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}</h1></div>
      <div className="stat-row">
        <Link to="/admin/inquiries" className="stat"><strong>{s.newInq ?? '…'}</strong><span>new inquiries to answer</span></Link>
        <div className="stat"><strong>{s.confirmed ?? '…'}</strong><span>confirmed bookings</span></div>
        <Link to="/admin/packages" className="stat"><strong>{s.packages ?? '…'}</strong><span>packages live on the site</span></Link>
        <Link to="/admin/departures" className="stat"><strong>{s.departures ?? '…'}</strong><span>upcoming open departures</span></Link>
      </div>
      <h2 className="admin-sub">Latest requests</h2>
      {recent.length === 0 ? <p className="muted">Nothing yet. Requests from the website will appear here.</p> : (
        <ul className="recent">
          {recent.map((r) => (
            <li key={r.id}>
              <span className={`badge badge--${r.kind}`}>{r.kind === 'booking' ? 'Booking' : 'Inquiry'}</span>
              <strong>{r.full_name}</strong>
              <span>{r.package?.title || 'Custom trip'}</span>
              <span className={`status status--${r.status}`}>{r.status}</span>
              <span className="muted">{formatDate(r.created_at)}</span>
            </li>
          ))}
        </ul>
      )}
      <h2 className="admin-sub">Quick actions</h2>
      <div className="quick">
        <Link className="btn btn--navy" to="/admin/packages">Build a package</Link>
        <Link className="btn btn--outline" to="/admin/hotels">Add a hotel</Link>
        <Link className="btn btn--outline" to="/admin/attractions">Add an attraction</Link>
        <a className="btn btn--outline" href="/" target="_blank" rel="noreferrer">View website</a>
      </div>
    </div>
  );
}
