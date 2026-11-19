import { useSettings } from '../lib/settings';

export default function Logo() {
  const { settings } = useSettings();
  if (settings.logo_url) return <img className="logo-img" src={settings.logo_url} alt="ZaNiheza" />;
  return (
    <>
      <img className="mark" src="/brand/zaniheza-mark.png" alt="" width="38" height="36" />
      <span className="brand-word">Za<b>Niheza</b></span>
    </>
  );
}
