import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';

const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}

let gisPromise;
function loadGoogleScript() {
  gisPromise ||= new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) { resolve(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => { gisPromise = null; reject(new Error('Google sign-in could not load')); };
    document.head.appendChild(s);
  });
  return gisPromise;
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Google's own button: sign-in happens on zaniheza.com, so Google shows your domain,
// not the Supabase address. Falls back to the redirect button if it can't load.
function GoogleButton({ next, onError }) {
  const ref = useRef(null);
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);
  const { signInWithGoogle } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadGoogleScript();
        if (cancelled || !ref.current) return;
        const raw = crypto.randomUUID();
        const hashed = await sha256Hex(raw);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: hashed,
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
          callback: async (resp) => {
            const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: resp.credential, nonce: raw });
            if (error) onError(`Google sign-in didn’t work (${error.message}). Use your email below.`);
            else navigate(next);
          },
        });
        const width = Math.min(400, Math.max(220, Math.round(ref.current.getBoundingClientRect().width)));
        window.google.accounts.id.renderButton(ref.current, { theme: 'outline', size: 'large', text: 'continue_with', shape: 'pill', width });
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [next, navigate, onError]);

  if (failed) {
    return (
      <button type="button" className="btn btn--google btn--block" onClick={() => signInWithGoogle(next)}>
        <GoogleG /> Continue with Google
      </button>
    );
  }
  return <div ref={ref} className="gis-button" style={{ minHeight: 44, display: 'flex', justifyContent: 'center' }} />;
}

// Sign in with Google (main route) or an email link (fallback). No passwords for members.
export default function AuthPanel({ next = '/me' }) {
  const { signInWithGoogle, signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  async function google() {
    setMsg('');
    const { error } = await signInWithGoogle(next);
    if (error) setMsg(`Google sign-in isn’t available right now (${error.message}). Use your email below.`);
  }
  async function byEmail(e) {
    e.preventDefault();
    setBusy(true); setMsg('');
    const { error } = await signInWithEmail(email.trim(), next);
    setBusy(false);
    setMsg(error ? `We couldn’t send the link: ${error.message}` : `Check ${email.trim()} for your sign-in link.`);
  }

  return (
    <div>
      {GOOGLE_CLIENT_ID ? (
        <GoogleButton next={next} onError={setMsg} />
      ) : (
        <button type="button" className="btn btn--google btn--block" onClick={google}><GoogleG /> Continue with Google</button>
      )}
      <div className="or">or use your email</div>
      <form className="form" onSubmit={byEmail}>
        <label>Email<input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <button className="btn btn--outline btn--block" disabled={busy}>{busy ? 'Sending…' : 'Email me a sign-in link'}</button>
      </form>
      {msg && <p className="note" role="status" style={{ marginTop: '1rem' }}>{msg}</p>}
      <p className="small" style={{ marginTop: '1rem' }}>Free to join. We never post anything for you.</p>
    </div>
  );
}
