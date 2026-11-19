import { CONTENT_DEFAULTS } from './content';
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isConfigured } from './supabase';

export const DEFAULT_SETTINGS = {
  site_name: 'ZaNiheza',
  logo_url: null,
  hero_image_url: null,
  hero_position: 'center 30%',
  hero_title: 'Africa’s Friendliest Travel Community',
  hero_subtitle: 'Youth-hosted Trips, launching first in Rwanda. Lunch, tours, translation & content — with local young people who love their town. Kigali + small towns first, Africa from there.',
  about_text: 'ZaNiheza is Africa’s Friendliest Travel Community: a community of young travellers and the local youth who host them. We are launching first in Rwanda for hosting, in Kigali, Nyanza and Musanze, and growing across Africa from there.',
  email: 'muraho@zaniheza.com',
  whatsapp: '250787426884',
  phone: '+250 787 426 884',
  whatsapp_community_url: null,
  instagram_url: 'https://www.instagram.com/zaniheza_travel',
  instagram_handle: '@zaniheza_travel',
  linkedin_url: 'https://www.linkedin.com/company/zanihezatravel',
  tiktok_url: 'https://www.tiktok.com/@zanihezatravel',
  content: {},
};

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, reload: () => {} });

const CACHE_KEY = 'zn-settings-v2';
function readCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; } catch { return {}; }
}

export function SettingsProvider({ children }) {
  // Show the last known logo, hero photo and texts instantly, then refresh from the database
  const [settings, setSettings] = useState(() => ({ ...DEFAULT_SETTINGS, ...readCache() }));

  const reload = async () => {
    if (!isConfigured) return;
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (data) {
      const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== ''));
      setSettings({ ...DEFAULT_SETTINGS, ...clean });
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(clean)); } catch { /* private mode */ }
    }
  };

  useEffect(() => { reload(); }, []);

  return <SettingsContext.Provider value={{ settings, reload }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);

// Page text: admin-edited wording, falling back to the defaults in content.js
export function useContent() {
  const { settings } = useSettings();
  return { ...CONTENT_DEFAULTS, ...Object.fromEntries(Object.entries(settings.content || {}).filter(([, v]) => v)) };
}
