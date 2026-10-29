import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Logo from './Logo';

const LINKS = [
  { to: '/experiences', label: 'Experiences' },
  { to: '/packages', label: 'Packages' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link to="/" className="brand" aria-label="ZaNiheza home"><Logo /></Link>
        <nav className={`nav ${open ? 'nav--open' : ''}`} id="main-nav" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav-link">{l.label}</NavLink>
          ))}
          <Link to="/contact" className="btn btn--amber nav-cta">Plan my trip</Link>
        </nav>
        <button
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-bars" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
