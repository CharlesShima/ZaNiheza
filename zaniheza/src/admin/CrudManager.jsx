import { useEffect, useMemo, useState } from 'react';
import { supabase, run } from '../lib/supabase';
import { slugify } from '../lib/format';
import { useAuth } from '../lib/auth';
import { FieldInput, emptyFor } from './Fields';

export default function CrudManager({ config }) {
  const { table, title, singular, fields, columns, orderBy = 'created_at', ascending = false, select = '*', folder } = config;
  const { isAdmin } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');

  const blank = useMemo(() => Object.fromEntries(fields.map((f) => [f.key, emptyFor(f)])), [fields]);

  async function load() {
    setLoading(true);
    try { setRows(await run(supabase.from(table).select(select).order(orderBy, { ascending }))); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); setEditing(null); }, [table]);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    const payload = {};
    for (const f of fields) {
      let v = editing[f.key];
      if (f.type === 'list' && Array.isArray(v)) v = v.map((s) => s.trim()).filter(Boolean);
      if (f.type === 'slug' && !v) v = slugify(editing[f.from]);
      payload[f.key] = v === '' && ['number', 'relation', 'date'].includes(f.type) ? null : v;
    }
    if ('updated_at' in (editing || {})) payload.updated_at = new Date().toISOString();
    try {
      if (editing.id) await run(supabase.from(table).update(payload).eq('id', editing.id));
      else await run(supabase.from(table).insert(payload));
      setEditing(null);
      await load();
    } catch (err) { alert(`Not saved: ${err.message}`); }
    finally { setSaving(false); }
  }

  async function remove(row) {
    if (!confirm(`Delete "${row[columns[0].key] || singular}"? This can't be undone.`)) return;
    try { await run(supabase.from(table).delete().eq('id', row.id)); await load(); }
    catch (err) { alert(`Not deleted: ${err.message}`); }
  }

  const shown = rows.filter((r) => !q || JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));
  const cell = (row, c) => (c.render ? c.render(row) : String(row[c.key] ?? ''));

  if (editing) {
    return (
      <form className="editor" onSubmit={save}>
        <div className="admin-head">
          <h1>{editing.id ? `Edit ${singular}` : `New ${singular}`}</h1>
          <div className="admin-head__actions">
            <button type="button" className="btn btn--outline" onClick={() => setEditing(null)}>Cancel</button>
            <button className="btn btn--navy" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
        <div className="editor-grid">
          {fields.map((f) => (
            <div key={f.key} className={`field ${f.wide ? 'field--wide' : ''} ${f.type === 'checkbox' ? 'field--check' : ''}`}>
              <label htmlFor={`f-${f.key}`}>{f.label}</label>
              <div id={`f-${f.key}`}>
                <FieldInput
                  field={f}
                  value={editing[f.key]}
                  values={editing}
                  folder={folder || table}
                  onChange={(v) => setEditing((cur) => ({ ...cur, [f.key]: v }))}
                />
              </div>
              {f.help && <small className="help">{f.help}</small>}
            </div>
          ))}
        </div>
        <div className="editor-foot">
          <button type="button" className="btn btn--outline" onClick={() => setEditing(null)}>Cancel</button>
          <button className="btn btn--navy" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    );
  }

  return (
    <div>
      <div className="admin-head">
        <h1>{title}</h1>
        <div className="admin-head__actions">
          <input className="search" type="search" placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${title}`} />
          <button className="btn btn--amber" onClick={() => setEditing({ ...blank })}>Add {singular}</button>
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      {loading ? <p>Loading…</p> : shown.length === 0 ? (
        <div className="empty">
          <p>No {title.toLowerCase()} yet.</p>
          <button className="btn btn--navy" onClick={() => setEditing({ ...blank })}>Add the first {singular}</button>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr>{columns.map((c) => <th key={c.key}>{c.label}</th>)}<th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => <td key={c.key} data-label={c.label}>{cell(r, c)}</td>)}
                  <td className="row-actions">
                    <button className="btn btn--small btn--outline" onClick={() => setEditing({ ...blank, ...r })}>Edit</button>
                    {isAdmin && <button className="btn btn--small btn--text danger" onClick={() => remove(r)}>Delete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
