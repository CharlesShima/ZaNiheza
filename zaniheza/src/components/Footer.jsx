import { Link } from 'react-router-dom';
import { useSettings } from '../lib/settings';
import { whatsappLink } from '../lib/format';
import Imigongo from './Imigongo';
import Logo from './Logo';

export default function Footer() {
  const { settings } = useSettings();
  return (
    <footer className="site-footer">
      <Imigongo tone="amber" />
      <div className="container footer-grid">
        <div>
          <Logo light />
          <p className="footer-blurb">Cultural and experiential journeys across Rwanda, designed to be authentic, respectful and unforgettable.</p>
        </div>
        <div>
          <h2 className="footer-title">Experiences</h2>
          <ul className="footer-list">
            <li><Link to="/experiences/kigali-yacu">Kigali Yacu</Link></li>
            <li><Link to="/experiences/sura-ahandi">Sura Ahandi</Link></li>
            <li><Link to="/experiences/umwimerere">Umwimerere</Link></li>
            <li><Link to="/experiences/umwami">Umwami</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Talk to us</h2>
          <ul className="footer-list">
            <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            <li><a href={whatsappLink(settings.whatsapp)} target="_blank" rel="noreferrer">WhatsApp {settings.phone}</a></li>
          </ul>
        </div>
        <div>
          <h2 className="footer-title">Follow @ZaNihezaTravel</h2>
          <ul className="footer-list">
            {settings.linkedin_url && <li><a href={settings.linkedin_url} target="_blank" rel="noreferrer">LinkedIn</a></li>}
            {settings.tiktok_url && <li><a href={settings.tiktok_url} target="_blank" rel="noreferrer">TikTok</a></li>}
            {settings.instagram_url && <li><a href={settings.instagram_url} target="_blank" rel="noreferrer">Instagram</a></li>}
          </ul>
        </div>
      </div>
      <div className="container footer-base">
        <span>© {new Date().getFullYear()} ZaNiheza Tour Operator, Kigali, Rwanda</span>
        <Link to="/admin">Team login</Link>
      </div>
    </footer>
  );
}
