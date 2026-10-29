import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && key);
export const supabase = createClient(url || 'http://localhost:54321', key || 'missing-key');

export async function run(query) {
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function uploadImage(file, folder = 'uploads') {
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-');
  const path = `${folder}/${Date.now()}-${safe}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '31536000',
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl;
}
