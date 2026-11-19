import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useSettings } from '../lib/settings';
import { CONTENT_DEFAULTS } from '../lib/content';
import { ImageInput } from './Fields';

const TEXT = [
  ['hero_title', 'Hero headline (the last two words are highlighted in amber)'],
  ['hero_subtitle', 'Hero sub-headline', 'textarea'],
  ['about_text', 'The idea page intro', 'textarea'],
  ['email', 'Email'],
  ['whatsapp_community_url', 'WhatsApp Community invite link (shown once, in the Community section)'],
  ['instagram_url', 'Instagram link'],
  ['instagram_handle', 'Instagram handle as shown, e.g. @zaniheza_travel'],
  ['tiktok_url', 'TikTok link'],
  ['linkedin_url', 'LinkedIn link'],
];

const PAGE_TEXT = [
  ['hero_kicker', 'Hero badge'],
  ['idea_title', 'The Idea: heading'],
  ['idea_1', 'The Idea: line 1'],
  ['idea_2', 'The Idea: line 2'],
  ['idea_3', 'The Idea: line 3'],
  ['community_title', 'Community: heading'],
  ['community_text', 'Community: intro', 'textarea'],
  ['how_title', 'How it works: heading'],
  ['join_title', 'Join: heading'],
  ['join_text', 'Join: intro', 'textarea'],
  ['host_title', 'Host a Trip: heading'],
  ['host_text', 'Host a Trip: intro', 'textarea'],
  ['stories_title', 'Stories: heading'],
  ['stories_text', 'Stories: intro', 'textarea'],
  ['pilots_title', 'Pilots: heading'],
  ['pilots_text', 'Pilots: intro', 'textarea'],
  ['footer_text', 'Footer text', 'textarea'],
];

export default function Settings() {
  const { reload } = useSettings();
  const [v, setV] = useState(null);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data }) => setV({ content: {}, ...(data || { id: 1 }) }));
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
  const setText = (k) => (e) => setV((cur) => ({ ...cur, content: { ...(cur.content || {}), [k]: e.target.value } }));

  return (
    <form onSubmit={save}>
      <div className="admin-head">
        <h1>Website settings & text</h1>
        <button className="btn btn--navy">Save settings</button>
      </div>
      {saved && <p className="note" role="status">{saved}</p>}

      <h2 className="admin-sub">Brand & hero</h2>
      <div className="editor-grid">
        <div className="field"><label>Logo (optional)</label><ImageInput value={v.logo_url} onChange={set('logo_url')} folder="brand" />
          <small className="help">Leave empty to use the built-in ZaNiheza sun-pin logo.</small></div>
        <div className="field"><label>Hero photo (optional)</label><ImageInput value={v.hero_image_url} onChange={set('hero_image_url')} folder="brand" />
          <small className="help">Leave empty to use the Kigali photo. Real photos only.</small></div>
        <div className="field"><label htmlFor="hero_position">Hero photo focus</label>
          <select id="hero_position" value={v.hero_position || 'center 30%'} onChange={(e) => set('hero_position')(e.target.value)}>
            <option value="center top">Top</option>
            <option value="center 30%">Upper middle</option>
            <option value="center center">Middle</option>
            <option value="center bottom">Bottom</option>
          </select></div>
        {TEXT.map(([k, label, type]) => (
          <div key={k} className={`field ${type ? 'field--wide' : ''}`}>
            <label htmlFor={k}>{label}</label>
            {type === 'textarea'
              ? <textarea id={k} rows="3" value={v[k] || ''} onChange={(e) => set(k)(e.target.value)} />
              : <input id={k} value={v[k] || ''} onChange={(e) => set(k)(e.target.value)} />}
          </div>
        ))}
      </div>

      <h2 className="admin-sub">Page text</h2>
      <p className="muted">Leave a box empty to use the default wording shown in grey.</p>
      <div className="editor-grid">
        {PAGE_TEXT.map(([k, label, type]) => (
          <div key={k} className={`field ${type ? 'field--wide' : ''}`}>
            <label htmlFor={`c-${k}`}>{label}</label>
            {type === 'textarea'
              ? <textarea id={`c-${k}`} rows="3" placeholder={CONTENT_DEFAULTS[k]} value={v.content?.[k] || ''} onChange={setText(k)} />
              : <input id={`c-${k}`} placeholder={CONTENT_DEFAULTS[k]} value={v.content?.[k] || ''} onChange={setText(k)} />}
          </div>
        ))}
      </div>
      <div className="editor-foot"><button className="btn btn--navy">Save settings</button></div>
    </form>
  );
}
