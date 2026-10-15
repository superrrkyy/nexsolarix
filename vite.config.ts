import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // `VITE_BASE` lets the same build be hosted from a sub-folder (GitHub Pages).
  const { VITE_BASE } = loadEnv(mode, process.cwd(), 'VITE_');
  const base = VITE_BASE && VITE_BASE !== '/' ? (VITE_BASE.endsWith('/') ? VITE_BASE : `${VITE_BASE}/`) : '/';

  return {
  base,
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    // The sandbox preview is served from a different origin, so keep the
    // dev server permissive: allow any host and any forwarded origin.
    allowedHosts: true,
    cors: true,
    // Building from another terminal must not spam the dev server with reloads.
    watch: { ignored: ['**/dist/**', '**/dist-base/**'] },
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: false,
    allowedHosts: true,
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    globals: true,
  },
  };
});
