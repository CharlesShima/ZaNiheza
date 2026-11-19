// Preview only: puts images and the video inside the single preview file so it works anywhere.
import { readFileSync, writeFileSync } from 'node:fs';
const file = 'dist-demo/index.html';
let html = readFileSync(file, 'utf8');
const types = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', mp4: 'video/mp4' };
for (const p of ['/media/hero-kigali.webp', '/media/hero-kigali-mobile.webp', '/brand/zaniheza-mark.png', '/media/kigali-sunday.jpg', '/media/kigali-sunday.mp4']) {
  const data = `data:${types[p.split('.').pop()]};base64,${readFileSync(`public${p}`).toString('base64')}`;
  html = html.split(`"${p}"`).join(`"${data}"`);
}
html = html.replace(/<link rel="preload"[^>]*>\s*/g, '');
writeFileSync(file, html);
console.log(`Preview file: ${(html.length / 1e6).toFixed(1)} MB`);
