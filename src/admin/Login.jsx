import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import Logo from '../components/Logo';
import Seo from '../components/Seo';

// Turns Supabase's error into a plain explanation, keeping the original text for troubleshooting
function explain(raw = '') {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return 'That email and password don\'t match. Check them, or use "Email me a reset link". (Invalid login credentials)';
  if (m.includes('email not confirmed')) return 'This email hasn\'t been confirmed yet in Supabase. (Email not confirmed)';
  if (m.includes('api key') || m.includes('apikey')) return `The website's Supabase key is wrong. Check VITE_SUPABASE_ANON_KEY in Netlify and redeploy. (${raw})`;
  if (m.includes('failed to fetch') || m.includes('network')) return `The website can't reach Supabase. Check VITE_SUPABASE_URL in Netlify and redeploy. (${raw})`;
  return `Login failed: ${raw}`;
}

export default function Login() {
  const { session, isStaff, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  if (!loading && session && isStaff) return <Navigate to="/admin" replace />;

  async function signIn(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (error) setMsg(explain(error.message));
    } catch (err) {
      setMsg(explain(err.message));
    }
    setBusy(false);
  }
  async function reset() {
    if (!email) { setMsg('Enter your email first, then choose "Email me a reset link".'); return; }
    await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/admin/account` });
    setMsg('If that email belongs to the team, a reset link is on its way.');
  }

  return (
    <div className="login-page">
      <Seo title="Team login" noindex />
      <form className="login-card" onSubmit={signIn}>
        <Logo />
        <h1>Team login</h1>
        {!isConfigured && <p className="form-error">Supabase isn't connected yet. Add your keys (README, step 2).</p>}
        <label>Email<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {msg && <p className="note" role="status">{msg}</p>}
        <button className="btn btn--navy btn--block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <button type="button" className="btn btn--text" onClick={reset}>Email me a reset link</button>
      </form>
    </div>
  );
}
