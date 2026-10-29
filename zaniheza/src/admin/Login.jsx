import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase, isConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';
import Logo from '../components/Logo';
import Seo from '../components/Seo';

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
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg('That email and password don\'t match. Check them, or use "Email me a reset link".');
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
