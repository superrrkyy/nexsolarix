import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const envDir = resolve(process.cwd(), '../..');
  const env = loadEnv(mode, envDir, '');
  return {
    envDir,
    define: {
      'import.meta.env.API_BASE_URL': JSON.stringify(env.API_BASE_URL || '/api')
    },
    plugins: [react(), tailwindcss()],
    server: {
      host: '0.0.0.0',
      allowedHosts: true,
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:4000',
          changeOrigin: true
        }
      }
    },
    preview: {
      host: '0.0.0.0',
      allowedHosts: true
    },
    build: {
      target: 'es2022',
      chunkSizeWarningLimit: 750,
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('node_modules/three-stdlib')) return 'three-stdlib';
            if (id.includes('node_modules/three/')) return 'three-core';
            if (id.includes('node_modules/@react-three/')) return 'react-three';
            if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor';
          }
        }
      }
    },
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      exclude: ['e2e/**', '**/node_modules/**', '**/dist/**'],
      css: true
    }
  };
});
