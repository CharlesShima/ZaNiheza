import { useEffect, useState } from 'react';
import { supabase, uploadImage } from '../lib/supabase';
import ItineraryEditor from './ItineraryEditor';

export function emptyFor(f) {
  if (f.default !== undefined) return f.default;
  switch (f.type) {
    case 'checkbox': return false;
    case 'images': case 'list': case 'highlights': case 'itinerary': return [];
    case 'number': case 'relation': case 'image': case 'date': return null;
    default: return '';
  }
}

export function ImageInput({ value, onChange, folder }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function pick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try { onChange(await uploadImage(file, folder)); }
    catch (x) { setErr(x.message); }
    finally { setBusy(false); e.target.value = ''; }
  }
  return (
    <div className="img-input">
      {value ? <img src={value} alt="" /> : <div className="img-input__empty">No image</div>}
      <div className="img-input__actions">
        <label className="btn btn--small btn--outline">
          {busy ? 'Uploading…' : value ? 'Replace image' : 'Upload image'}
          <input type="file" accept="image/*" hidden onChange={pick} disabled={busy} />
        </label>
        {value && <button type="button" className="btn btn--small btn--text" onClick={() => onChange(null)}>Remove</button>}
      </div>
      {err && <p className="form-error">{err}</p>}
    </div>
  );
}

function ImagesInput({ value = [], onChange, folder }) {
  const [busy, setBusy] = useState(false);
  async function pick(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    try {
      const urls = [];
      for (const f of files) urls.push(await uploadImage(f, folder));
      onChange([...(value || []), ...urls]);
    } finally { setBusy(false); e.target.value = ''; }
  }
  return (
    <div>
      <div className="thumbs">
        {(value || []).map((src) => (
          <figure key={src}>
            <img src={src} alt="" />
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((v) => v !== src))}>×</button>
          </figure>
        ))}
      </div>
      <label className="btn btn--small btn--outline">
        {busy ? 'Uploading…' : 'Add images'}
        <input type="file" accept="image/*" multiple hidden onChange={pick} disabled={busy} />
      </label>
    </div>
  );
}

function ListInput({ value = [], onChange, placeholder }) {
  return (
    <textarea
      rows="4"
      placeholder={placeholder || 'One item per line'}
      value={(value || []).join('\n')}
      onChange={(e) => onChange(e.target.value.split('\n'))}
      onBlur={(e) => onChange(e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))}
    />
  );
}

function HighlightsInput({ value = [], onChange }) {
  const list = value || [];
  const update = (i, k, v) => onChange(list.map((h, j) => (j === i ? { ...h, [k]: v } : h)));
  return (
    <div className="stack">
      {list.map((h, i) => (
        <div key={i} className="hl-row">
          <input placeholder="Title" value={h.title || ''} onChange={(e) => update(i, 'title', e.target.value)} />
          <input placeholder="Short description" value={h.text || ''} onChange={(e) => update(i, 'text', e.target.value)} />
          <button type="button" className="btn btn--small btn--text" onClick={() => onChange(list.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      <button type="button" className="btn btn--small btn--outline" onClick={() => onChange([...list, { title: '', text: '' }])}>Add highlight</button>
    </div>
  );
}

function RelationInput({ value, onChange, relation }) {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    supabase.from(relation.table).select(`id, ${relation.label}`).order(relation.label)
      .then(({ data }) => setOptions(data || []));
  }, [relation.table, relation.label]);
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{relation.empty || 'None'}</option>
      {options.map((o) => <option key={o.id} value={o.id}>{o[relation.label]}</option>)}
    </select>
  );
}

export function FieldInput({ field: f, value, onChange, values, folder }) {
  switch (f.type) {
    case 'textarea':
      return <textarea rows={f.rows || 5} value={value || ''} onChange={(e) => onChange(e.target.value)} />;
    case 'number':
      return <input type="number" step="any" value={value ?? ''} onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} />;
    case 'date':
      return <input type="date" value={value || ''} onChange={(e) => onChange(e.target.value || null)} />;
    case 'select':
      return (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    case 'checkbox':
      return <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />;
    case 'image': return <ImageInput value={value} onChange={onChange} folder={folder} />;
    case 'images': return <ImagesInput value={value} onChange={onChange} folder={folder} />;
    case 'list': return <ListInput value={value} onChange={onChange} placeholder={f.placeholder} />;
    case 'highlights': return <HighlightsInput value={value} onChange={onChange} />;
    case 'relation': return <RelationInput value={value} onChange={onChange} relation={f.relation} />;
    case 'itinerary': return <ItineraryEditor value={value} onChange={onChange} values={values} />;
    default:
      return <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={f.placeholder} />;
  }
}
