import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let alive = true;
    if (!session) { setProfile(null); setLoading(false); return; }
    setLoading(true);
    supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
      .then(({ data }) => { if (alive) { setProfile(data); setLoading(false); } });
    return () => { alive = false; };
  }, [session]);

  const role = profile?.role;
  const value = {
    session, profile, loading, role,
    isStaff: role === 'advisor' || role === 'admin',
    isAdmin: role === 'admin',
    signOut: () => supabase.auth.signOut(),
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
