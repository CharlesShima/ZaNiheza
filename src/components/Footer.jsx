import { Link } from 'react-router-dom';
import { useSettings, useContent } from '../lib/settings';
import Imigongo from './Imigongo';

export default function Footer() {
  const { settings } = useSettings();
  const c = useContent();
  return (
    <footer className="site-footer">
      <Imigongo />
      <div className="container footer-grid">
        <div>
          <span className="brand-word">Za<b>Niheza</b></span>
          <p style={{ marginTop: '.9rem', maxWidth: '42ch' }}>{c.footer_text}</p>
        </div>
        <div>
          <h2 className="footer-title">Explore</h2>
          <ul className="footer-list">
            <li><Link to="/trips">Browse Trips</Link></li>
            <li><Link to="/stories">Stories</Link></li>
            <li><Link to="/host">Host a Trip</Link></li>
            <li><Link to="/umwimerere">Umwimerere private trips</Link></li>
            <li><Link to="/about">The idea</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Say hello</h2>
          <ul className="footer-list">
            <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            {settings.instagram_url && <li><a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram {settings.instagram_handle || '@zaniheza_travel'}</a></li>}
            {settings.tiktok_url && <li><a href={settings.tiktok_url} target="_blank" rel="noreferrer">TikTok</a></li>}
            {settings.linkedin_url && <li><a href={settings.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a></li>}
            <li><Link to="/contact">Contact & groups</Link></li>
          </ul>
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} ZaNiheza. Launching first in Rwanda, growing across Africa.</span>
        <span>zaniheza.com</span>
      </div>
    </footer>
  );
}
