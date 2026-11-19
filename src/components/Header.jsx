import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo';
import { useAuth } from '../lib/auth';

// One persistent top header on every page. All six items stay visible on phones.
export default function Header() {
  const { user } = useAuth();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="ZaNiheza home"><Logo /></Link>
        <nav className="nav" aria-label="Main">
          <NavLink to="/trips">Trips</NavLink>
          <NavLink to="/hosts">Hosts</NavLink>
          <NavLink to="/community">Community</NavLink>
          <NavLink to="/stories">Stories</NavLink>
          <NavLink to={user ? '/me' : '/join'} className="nav-join">{user ? 'My trips' : 'Join'}</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </div>
    </header>
  );
}
