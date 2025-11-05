import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { transform as esbuildTransform } from 'esbuild';

// Pre-transform .js files with JSX before Vite import-analysis
function forceJsxInJs() {
  return {
    name: 'force-jsx-in-js',
    enforce: 'pre',
    async transform(code, id) {
      if (id.endsWith('.js') && /<\w+/.test(code)) {
        const result = await esbuildTransform(code, {
          loader: 'jsx',
          jsx: 'automatic',
          sourcemap: true,
        });
        return { code: result.code, map: result.map };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    forceJsxInJs(),
    react({
      // Explicitly process both .js and .jsx for JSX
      include: [/\.jsx?$/],
    }),
  ],
  esbuild: {
    loader: 'jsx',
    include: /(?:src|tests)\/.*\.(js|jsx)$/,
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    // Ensure vitest treats .js with JSX as web (transform)
    transformMode: { web: [/\.jsx?$/] },
    includeSource: [
      'src/**/*.{js,jsx}',
      'tests/**/*.{js,jsx}',
    ],
  },
});