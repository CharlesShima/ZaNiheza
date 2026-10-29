import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Logo from '../components/Logo';
import Seo from '../components/Seo';
import Login from './Login';
import Dashboard from './Dashboard';
import Inquiries from './Inquiries';
import CrudManager from './CrudManager';
import Settings from './Settings';
import Team from './Team';
import Account from './Account';
import { CONFIGS } from './config';
import './admin.css';

function RequireStaff({ children, adminOnly = false }) {
  const { session, loading, isStaff, isAdmin, signOut } = useAuth();
  if (loading) return <p className="admin-loading">Loading…</p>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isStaff || (adminOnly && !isAdmin)) {
    return (
      <div className="login-page"><div className="login-card">
        <h1>No access</h1>
        <p>{adminOnly ? 'Only admins can open this page.' : 'This account isn\'t part of the ZaNiheza team yet. Ask an admin to give you the advisor role.'}</p>
        <button className="btn btn--outline" onClick={signOut}>Log out</button>
      </div></div>
    );
  }
  return children;
}

function Layout() {
  const { profile, isAdmin, signOut } = useAuth();
  const link = (to, label) => <NavLink to={to} end={to === '/admin'} className="side-link">{label}</NavLink>;
  return (
    <div className="admin">
      <Seo title="Admin" noindex />
      <aside className="admin-side">
        <div className="admin-brand"><Logo light /></div>
        <nav aria-label="Admin">
          {link('/admin', 'Overview')}
          {link('/admin/inquiries', 'Inquiries & bookings')}
          <span className="side-group">Build</span>
          {link('/admin/packages', 'Packages')}
          {link('/admin/departures', 'Dates & availability')}
          {link('/admin/experiences', 'Experiences')}
          <span className="side-group">Catalog</span>
          {link('/admin/hotels', 'Hotels')}
          {link('/admin/cars', 'Vehicles')}
          {link('/admin/attractions', 'Attractions & museums')}
          {isAdmin && <><span className="side-group">Admin</span>{link('/admin/settings', 'Website settings')}{link('/admin/team', 'Team & roles')}</>}
        </nav>
        <div className="admin-user">
          <NavLink to="/admin/account">{profile?.full_name || profile?.email}</NavLink>
          <span className="muted">{profile?.role}</span>
          <button className="btn btn--small btn--ghost-light" onClick={signOut}>Log out</button>
        </div>
      </aside>
      <main className="admin-main"><Outlet /></main>
    </div>
  );
}

export default function AdminApp() {
  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route element={<RequireStaff><Layout /></RequireStaff>}>
        <Route index element={<Dashboard />} />
        <Route path="inquiries" element={<Inquiries />} />
        {['packages', 'departures', 'experiences', 'hotels', 'cars', 'attractions'].map((k) => (
          <Route key={k} path={k} element={<CrudManager config={CONFIGS[k]} />} />
        ))}
        <Route path="settings" element={<RequireStaff adminOnly><Settings /></RequireStaff>} />
        <Route path="team" element={<RequireStaff adminOnly><Team /></RequireStaff>} />
        <Route path="account" element={<Account />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
}
