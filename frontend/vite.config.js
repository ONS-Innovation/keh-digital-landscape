import { defineConfig } from 'vite';
import ClosePlugin from './vite-plugin-close';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ClosePlugin()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  server: {
    port: 3000,
    proxy: Object.fromEntries(
      ['/api', '/user/api', '/copilot/api', '/admin/api', '/review/api'].map(
        path => [
          path,
          {
            target: process.env.VITE_BACKEND_URL || 'http://localhost:5001',
            changeOrigin: true,
            secure: false,
          },
        ]
      )
    ),
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
  define: {
    global: 'globalThis',
  },
});
