import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../lib/auth';

// One persistent top header on every page. Admin only shows for the ZaNiheza team.
export default function Header() {
  const { user, isStaff } = useAuth();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="ZaNiheza home"><Logo /></Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/trips">Trips</NavLink>
          <NavLink to="/hosts">Hosts</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/stories">Stories</NavLink>
          <NavLink to={user ? '/me' : '/join'} className="nav-join">{user ? 'Dashboard' : 'Join'}</NavLink>
          {isStaff && <NavLink to="/admin">Admin</NavLink>}
        </nav>
      </div>
    </header>
  );
}
