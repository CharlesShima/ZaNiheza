// Runs after `vite build`: writes dist/sitemap.xml including every published experience and package.
import { writeFileSync } from 'node:fs';

const site = (process.env.VITE_SITE_URL || 'https://zaniheza.com').replace(/\/$/, '');
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
const paths = ['/', '/experiences', '/packages', '/about', '/contact'];

async function slugs(table) {
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/${table}?select=slug&is_published=eq.true`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return res.ok ? (await res.json()).map((r) => r.slug) : [];
  } catch { return []; }
}

const exp = await slugs('experiences');
const pkg = await slugs('packages');
exp.forEach((s) => paths.push(`/experiences/${s}`));
pkg.forEach((s) => paths.push(`/packages/${s}`));

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${site}${p}</loc></url>`).join('\n')}
</urlset>
`;
writeFileSync('dist/sitemap.xml', xml);
console.log(`sitemap.xml written with ${paths.length} URLs`);
