import { createClient } from '@supabase/supabase-js';

// Clean up common copy-paste mistakes: spaces, a trailing slash, or the /rest/v1 ending
const url = (import.meta.env.VITE_SUPABASE_URL || '')
  .trim()
  .replace(/\/rest\/v1\/?$/, '')
  .replace(/\/+$/, '');
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isConfigured = Boolean(url && key);
export const supabase = createClient(url || 'http://localhost:54321', key || 'missing-key');

export async function run(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// Shrinks photos before upload: max 2000 px wide, saved as WebP (keeps transparency for logos).
// A 6 MB phone photo usually becomes 200 to 400 KB, so pages load much faster.
async function shrink(file, maxWidth = 2000, quality = 0.82) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  let bitmap;
  try { bitmap = await createImageBitmap(file); } catch { return file; }
  const scale = Math.min(1, maxWidth / bitmap.width);
  if (scale === 1 && file.size < 300 * 1024) return file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  if (!blob || blob.size >= file.size) return file;
  const ext = blob.type === 'image/webp' ? 'webp' : blob.type.split('/')[1] || 'img';
  return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.${ext}`, { type: blob.type });
}

export async function uploadImage(original, folder = 'uploads') {
  const file = await shrink(original);
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
