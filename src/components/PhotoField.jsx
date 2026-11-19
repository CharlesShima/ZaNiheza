import { useState } from 'react';
import { uploadImage } from '../lib/supabase';
import { Avatar } from './Common';

// Members upload into media/members/<their id>/, which the database allows only for them
export default function PhotoField({ label, value, onChange, userId, round = true }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  async function pick(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true); setErr('');
    try { onChange(await uploadImage(f, `members/${userId}`)); }
    catch (x) { setErr(`Upload failed: ${x.message}`); }
    finally { setBusy(false); e.target.value = ''; }
  }
  return (
    <div className="label">
      <span>{label}</span>
      <div className="photo-input">
        {round ? <Avatar src={value} name="?" size="avatar--lg" /> : value ? <img src={value} alt="" style={{ width: 160, borderRadius: 12 }} /> : null}
        <label className="btn btn--outline btn--small" style={{ display: 'inline-flex' }}>
          {busy ? 'Uploading…' : value ? 'Change photo' : 'Upload a photo'}
          <input type="file" accept="image/*" hidden onChange={pick} disabled={busy} />
        </label>
      </div>
      {err && <span className="form-error">{err}</span>}
    </div>
  );
}
