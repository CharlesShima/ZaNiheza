import { useSettings } from '../lib/settings';

export default function Logo({ light = false }) {
  const { settings } = useSettings();
  if (settings.logo_url) {
    const img = <img className="logo-img" src={settings.logo_url} alt={`${settings.site_name} Tour Operator`} />;
    // On dark backgrounds (footer, admin menu) the logo sits on a white tile so a navy logo stays visible
    return light
      ? <span style={{ display: 'inline-block', background: '#fff', padding: '8px 12px', borderRadius: 6 }}>{img}</span>
      : img;
  }
  return (
    <span className={`logo-text ${light ? 'logo-text--light' : ''}`}>
      <svg viewBox="0 0 40 44" aria-hidden="true">
        <path className="logo-pin" d="M20 2a16 16 0 0 0-16 16c0 11 16 24 16 24s16-13 16-24A16 16 0 0 0 20 2z" />
        <circle className="logo-sun" cx="20" cy="18" r="7" />
      </svg>
      <span>
        <strong>{settings.site_name}</strong>
        <small>Tour operator</small>
      </span>
    </span>
  );
}
