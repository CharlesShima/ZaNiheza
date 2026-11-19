// Runs after `vite build`: writes dist/sitemap.xml with every live Trip, Story and host.
import { writeFileSync } from 'node:fs';

const site = (process.env.VITE_SITE_URL || 'https://zaniheza.com').replace(/\/$/, '');
const url = (process.env.VITE_SUPABASE_URL || '').trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const key = (process.env.VITE_SUPABASE_ANON_KEY || '').trim();
const paths = ['/', '/trips', '/hosts', '/community', '/stories', '/join', '/host', '/umwimerere', '/about', '/contact'];

async function rows(query) {
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    return res.ok ? await res.json() : [];
  } catch { return []; }
}

(await rows('trips?select=slug&status=in.(approved,completed)')).forEach((r) => paths.push(`/trips/${r.slug}`));
(await rows('stories?select=slug&status=eq.published')).forEach((r) => paths.push(`/stories/${r.slug}`));
(await rows('hosts?select=id&status=eq.approved')).forEach((r) => paths.push(`/hosts/${r.id}`));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync('dist/sitemap.xml', xml);
console.log(`sitemap.xml written with ${paths.length} URLs`);
