import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../lib/settings';
import { ImageInput } from './Fields';

const TEXT = [
  ['site_name', 'Business name'],
  ['hero_title', 'Home page headline'],
  ['hero_subtitle', 'Home page sub-headline', 'textarea'],
  ['about_text', 'About text', 'textarea'],
  ['email', 'Email'],
  ['whatsapp', 'WhatsApp number (digits with country code, e.g. 250787426884)'],
  ['phone', 'Phone as displayed'],
  ['linkedin_url', 'LinkedIn link'],
  ['tiktok_url', 'TikTok link'],
  ['instagram_url', 'Instagram link'],
];

export default function Settings() {
  const { reload } = useSettings();
  const [v, setV] = useState(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => setV(data || { id: 1 }));
  }, []);

  async function save(e) {
    e.preventDefault();
    const { id, ...rest } = v;
    const { error } = await supabase.from('site_settings').update({ ...rest, updated_at: new Date().toISOString() }).eq('id', 1);
    if (error) { setSaved(`Not saved: ${error.message}`); return; }
    setSaved('Saved. The website now shows these changes.');
    reload();
  }

  if (!v) return <p>Loading…</p>;
  const set = (k) => (val) => setV((cur) => ({ ...cur, [k]: val }));

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <h1>Website settings</h1>
        <button className="btn btn--navy">Save settings</button>
      </div>
      {saved && <p className="note" role="status">{saved}</p>}
      <div className="editor-grid">
        <div className="field"><label>Logo</label><ImageInput value={v.logo_url} onChange={set('logo_url')} folder="brand" />
          <small className="help">PNG or SVG with transparent background works best.</small></div>
        <div className="field"><label>Home page hero image</label><ImageInput value={v.hero_image_url} onChange={set('hero_image_url')} folder="brand" />
          <small className="help">Wide landscape photo, at least 1920 px wide.</small></div>
        <div className="field"><label htmlFor="hero_position">Hero photo focus</label>
          <select id="hero_position" value={v.hero_position || 'center 30%'} onChange={(e) => set('hero_position')(e.target.value)}>
            <option value="center top">Top (keep heads in view)</option>
            <option value="center 30%">Upper middle</option>
            <option value="center center">Middle</option>
            <option value="center bottom">Bottom</option>
          </select>
          <small className="help">If faces are cut off at the top, choose Top.</small></div>
        {TEXT.map(([k, label, type]) => (
          <div key={k} className={`field ${type ? 'field--wide' : ''}`}>
            <label htmlFor={k}>{label}</label>
            {type === 'textarea'
              ? <textarea id={k} rows="4" value={v[k] || ''} onChange={(e) => set(k)(e.target.value)} />
              : <input id={k} value={v[k] || ''} onChange={(e) => set(k)(e.target.value)} />}
          </div>
        ))}
      </div>
    </form>
  );
}
