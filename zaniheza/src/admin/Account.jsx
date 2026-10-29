import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/auth';

export default function Account() {
  const { profile } = useAuth();
  const [name, setName] = useState(profile?.full_name || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  async function save(e) {
    e.preventDefault();
    setMsg('');
    const { error: e1 } = await supabase.from('profiles').update({ full_name: name }).eq('id', profile.id);
    let e2 = null;
    if (password) ({ error: e2 } = await supabase.auth.updateUser({ password }));
    const err = e1 || e2;
    setMsg(err ? `Not saved: ${err.message}` : 'Saved.');
    setPassword('');
  }

  return (
    <form onSubmit={save} className="narrow-form">
      <div className="admin-head"><h1>My account</h1></div>
      <div className="field"><label htmlFor="nm">Your name</label><input id="nm" value={name} onChange={(e) => setName(e.target.value)} /></div>
      <div className="field"><label htmlFor="pw">New password</label>
        <input id="pw" type="password" minLength="8" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <small className="help">Invited advisors: set your password here the first time you log in.</small></div>
      <button className="btn btn--navy">Save</button>
      {msg && <p className="note" role="status">{msg}</p>}
    </form>
  );
}
