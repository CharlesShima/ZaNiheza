import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as backend from '../lib/supabase';

export default function DemoBar() {
  const nav = useNavigate();
  useEffect(() => {
    const h = (e) => nav(e.detail);
    window.addEventListener('demo-nav', h);
    return () => { window.removeEventListener('demo-nav', h); };
  }, [nav]);
  const go = async (who, path) => { await backend.demoSignIn?.(who); nav(path); };
  return (
    <div className="demo-bar" role="note">
      <span>Preview with sample data. Nothing is sent or charged.</span>
      <button onClick={() => go(null, '/')}>As a visitor</button>
      <button onClick={() => go('traveller', '/me')}>As a traveller</button>
      <button onClick={() => go('admin', '/admin')}>As admin</button>
      <button className="plain" onClick={() => backend.resetDemo?.()}>Reset</button>
    </div>
  );
}
