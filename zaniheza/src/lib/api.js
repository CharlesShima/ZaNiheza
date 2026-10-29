import { supabase, run, isConfigured } from './supabase';
import { FALLBACK_EXPERIENCES } from './fallback';

const today = () => new Date().toISOString().slice(0, 10);

export async function getExperiences() {
  if (!isConfigured) return FALLBACK_EXPERIENCES;
  try {
    const rows = await run(supabase.from('experiences').select('*').eq('is_published', true).order('sort_order'));
    return rows.length ? rows : FALLBACK_EXPERIENCES;
  } catch {
    return FALLBACK_EXPERIENCES;
  }
}

export async function getExperience(slug) {
  const fallback = FALLBACK_EXPERIENCES.find((e) => e.slug === slug) || null;
  if (!isConfigured) return fallback;
  try {
    const row = await run(supabase.from('experiences').select('*').eq('slug', slug).eq('is_published', true).maybeSingle());
    return row || fallback;
  } catch {
    return fallback;
  }
}

export function getPackages({ experienceId, featured, limit } = {}) {
  if (!isConfigured) return Promise.resolve([]);
  let q = supabase
    .from('packages')
    .select('id, slug, title, summary, duration_days, price_from, currency, cover_image, is_featured, experience:experiences(name, slug)')
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  if (experienceId) q = q.eq('experience_id', experienceId);
  if (featured) q = q.eq('is_featured', true);
  if (limit) q = q.limit(limit);
  return run(q);
}

export const getPackage = (slug) =>
  run(
    supabase
      .from('packages')
      .select('*, experience:experiences(name, slug, tagline), car:cars(*)')
      .eq('slug', slug)
      .eq('is_published', true)
      .maybeSingle()
  );

export const getByIds = (table, ids) =>
  ids.length ? run(supabase.from(table).select('*').in('id', ids)) : Promise.resolve([]);

export const getDepartures = (packageId) =>
  run(
    supabase
      .from('departures')
      .select('*')
      .eq('package_id', packageId)
      .gte('start_date', today())
      .neq('status', 'closed')
      .order('start_date')
  );

export async function sendInquiry(values) {
  const { error } = await supabase.from('inquiries').insert(values);
  if (error) throw error;

  // Optional email copy via Web3Forms (free). Failing here never blocks the inquiry.
  const key = import.meta.env.VITE_WEB3FORMS_KEY;
  if (key) {
    try {
      await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: key,
          subject: `New ${values.kind} from ${values.full_name}`,
          from_name: 'ZaNiheza website',
          ...values,
        }),
      });
    } catch { /* ignore */ }
  }
}
