import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [host, setHost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); });
    return () => { sub.subscription.unsubscribe(); };
  }, []);

  const refresh = useCallback(async () => {
    if (!session) { setProfile(null); setHost(null); setLoading(false); return; }
    const uid = session.user.id;
    const [{ data: p }, { data: h }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
      supabase.from('hosts').select('*').eq('user_id', uid).maybeSingle(),
    ]);
    setProfile(p); setHost(h); setLoading(false);
  }, [session]);

  useEffect(() => { setLoading(true); refresh(); }, [refresh]);

  const role = profile?.role;
  const value = {
    session, user: session?.user || null, profile, host, loading, role, refresh,
    isStaff: role === 'advisor' || role === 'admin',
    isAdmin: role === 'admin',
    signOut: () => supabase.auth.signOut(),
    signInWithGoogle: (next = '/me') =>
      supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}${next}` } }),
    signInWithEmail: (email, next = '/me') =>
      supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}${next}` } }),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
