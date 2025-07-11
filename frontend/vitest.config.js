import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.js'],
    cache: true, // Enable caching for faster test runs
    threads: true, // Use worker threads for parallel test execution
    coverage: {
      provider: 'v8', // Use V8 for coverage reporting
      reporter: ['text', 'html'], // Report coverage in text and HTML formats
      include: ['src/**/*.{js,jsx,ts,tsx}'], // Include all source files for coverage
      exclude: ['src/**/*.test.{js,jsx,ts,tsx}', 'src/setupTests.js'], // Exclude test files and setup files from coverage
      reportsDirectory: './coverage', // Specify coverage report directory
      all: true, // Include all files in coverage report
    },
    watchExclude: ['node_modules', 'dist'], // Exclude unnecessary directories during watch mode
    include: ['src/**/*.test.{js,jsx,ts,tsx}'], // Explicitly include test files
  },
});
