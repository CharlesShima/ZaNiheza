import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isConfigured } from './supabase';

export const DEFAULT_SETTINGS = {
  site_name: 'ZaNiheza',
  logo_url: null,
  hero_image_url: null,
  hero_title: 'Rwanda, through the eyes of its people',
  hero_subtitle: 'Cultural and experiential journeys shaped by local communities, history, creativity and nature.',
  about_text:
    'ZaNiheza is a Rwandan-based cultural and experiential travel company curating meaningful journeys that connect travelers to the heart of the country. We go beyond sightseeing to offer immersive experiences shaped by local communities, history, creativity and nature. Every journey with ZaNiheza is designed to be authentic, respectful and unforgettable.',
  email: 'muraho@zaniheza.com',
  whatsapp: '250787426884',
  phone: '+250 787 426 884',
  linkedin_url: 'https://www.linkedin.com/company/zanihezatravel',
  tiktok_url: 'https://www.tiktok.com/@zanihezatravel',
  instagram_url: null,
};

const SettingsContext = createContext({ settings: DEFAULT_SETTINGS, reload: () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const reload = async () => {
    if (!isConfigured) return;
    const { data } = await supabase.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (data) {
      const clean = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== ''));
      setSettings({ ...DEFAULT_SETTINGS, ...clean });
    }
  };

  useEffect(() => { reload(); }, []);

  return <SettingsContext.Provider value={{ settings, reload }}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
