import { useLocation, useNavigate } from 'react-router-dom';

export default function DemoBar() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith('/admin');
  const reset = async () => {
    if (!confirm('Put the sample data back as it started?')) return;
    const { resetDemo } = await import('../lib/supabase');
    resetDemo?.();
  };
  return (
    <div className="demo-bar" role="note">
      <span>Preview with sample prices and data. Your edits are kept in this browser only.</span>
      <span className="demo-bar__actions">
        <button onClick={() => nav(inAdmin ? '/' : '/admin')}>{inAdmin ? 'View website' : 'Open admin back office'}</button>
        <button onClick={reset}>Reset sample data</button>
      </span>
    </div>
  );
}
