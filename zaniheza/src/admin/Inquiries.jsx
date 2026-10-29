import { useEffect, useState } from 'react';
import { supabase, run } from '../lib/supabase';
import { formatDate, whatsappLink } from '../lib/format';
import { useAuth } from '../lib/auth';

const STATUSES = ['new', 'contacted', 'quoted', 'confirmed', 'cancelled'];

export default function Inquiries() {
  const { profile, isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [team, setTeam] = useState([]);
  const [filter, setFilter] = useState('open');
  const [mine, setMine] = useState(false);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    let q = supabase.from('inquiries')
      .select('*, package:packages(title, slug), experience:experiences(name), departure:departures(start_date)')
      .order('created_at', { ascending: false });
    if (filter === 'open') q = q.in('status', ['new', 'contacted', 'quoted']);
    else if (filter !== 'all') q = q.eq('status', filter);
    if (mine) q = q.eq('assigned_to', profile.id);
    try { setRows(await run(q)); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, [filter, mine]);
  useEffect(() => {
    supabase.from('profiles').select('id, full_name, email, role').in('role', ['advisor', 'admin'])
      .then(({ data }) => setTeam(data || []));
  }, []);

  async function patch(id, values) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...values } : r)));
    const { error } = await supabase.from('inquiries').update(values).eq('id', id);
    if (error) { alert(`Not saved: ${error.message}`); load(); }
  }
  async function remove(id) {
    if (!confirm('Delete this inquiry permanently?')) return;
    await supabase.from('inquiries').delete().eq('id', id);
    load();
  }

  return (
    <div>
      <div className="admin-head">
        <h1>Inquiries & bookings</h1>
        <div className="admin-head__actions">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by status">
            <option value="open">Open (new, contacted, quoted)</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            <option value="all">All</option>
          </select>
          <label className="check-inline"><input type="checkbox" checked={mine} onChange={(e) => setMine(e.target.checked)} /> Assigned to me</label>
        </div>
      </div>

      {loading ? <p>Loading…</p> : rows.length === 0 ? (
        <div className="empty"><p>No inquiries in this view. New requests from the website appear here.</p></div>
      ) : (
        <ul className="inq-list">
          {rows.map((r) => {
            const open = openId === r.id;
            const about = r.package?.title || r.experience?.name || 'Custom trip';
            return (
              <li key={r.id} className={`inq inq--${r.status}`}>
                <button className="inq-summary" aria-expanded={open} onClick={() => setOpenId(open ? null : r.id)}>
                  <span className={`badge badge--${r.kind}`}>{r.kind === 'booking' ? 'Booking' : 'Inquiry'}</span>
                  <strong>{r.full_name}</strong>
                  <span>{about}</span>
                  <span className="muted">{r.travelers} pax{r.travel_date ? `, ${formatDate(r.travel_date)}` : ''}</span>
                  <span className={`status status--${r.status}`}>{r.status}</span>
                  <span className="muted">{formatDate(r.created_at)}</span>
                </button>
                {open && (
                  <div className="inq-detail">
                    <dl className="inq-facts">
                      <div><dt>Email</dt><dd><a href={`mailto:${r.email}?subject=${encodeURIComponent(`Your ZaNiheza trip: ${about}`)}`}>{r.email}</a></dd></div>
                      <div><dt>Phone</dt><dd>{r.phone ? <a href={whatsappLink(r.phone, `Muraho ${r.full_name.split(' ')[0]}, this is ZaNiheza about your ${about} request.`)} target="_blank" rel="noreferrer">{r.phone} (WhatsApp)</a> : '-'}</dd></div>
                      <div><dt>Country</dt><dd>{r.country || '-'}</dd></div>
                      <div><dt>Budget</dt><dd>{r.budget || '-'}</dd></div>
                      <div><dt>Departure</dt><dd>{r.departure ? formatDate(r.departure.start_date) : 'Own dates'}</dd></div>
                    </dl>
                    {r.message && <p className="inq-msg">{r.message}</p>}
                    <div className="inq-controls">
                      <label>Status
                        <select value={r.status} onChange={(e) => patch(r.id, { status: e.target.value })}>
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </label>
                      <label>Advisor
                        <select value={r.assigned_to || ''} onChange={(e) => patch(r.id, { assigned_to: e.target.value || null })}>
                          <option value="">Unassigned</option>
                          {team.map((t) => <option key={t.id} value={t.id}>{t.full_name || t.email}</option>)}
                        </select>
                      </label>
                      <label className="span-2">Internal notes
                        <textarea rows="3" defaultValue={r.notes || ''} onBlur={(e) => e.target.value !== (r.notes || '') && patch(r.id, { notes: e.target.value })} />
                      </label>
                    </div>
                    {isAdmin && <button className="btn btn--small btn--text danger" onClick={() => remove(r.id)}>Delete inquiry</button>}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
