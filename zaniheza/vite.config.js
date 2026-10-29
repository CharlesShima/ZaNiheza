import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` = real site (Supabase). `npm run build:demo` = one-file preview with sample data.
export default defineConfig(({ mode }) => {
  const demo = mode === 'demo';
  const demoBackend = {
    name: 'demo-backend',
    enforce: 'pre',
    async resolveId(source, importer, options) {
      if (!importer || !/\/supabase$/.test(source)) return null;
      const r = await this.resolve(source, importer, { ...options, skipSelf: true });
      if (r && r.id.endsWith('/src/lib/supabase.js')) return r.id.replace(/supabase\.js$/, 'supabase.demo.js');
      return null;
    },
  };
  return {
    plugins: [react(), ...(demo ? [demoBackend, viteSingleFile()] : [])],
    build: { outDir: demo ? 'dist-demo' : 'dist', sourcemap: false },
  };
});
