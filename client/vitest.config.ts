import { defineConfig } from 'vitest/config';

// Separate from vite.config.ts: these tests only check plain functions
// (no React components), so they need no plugins and no browser.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
