import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://kylesnowschwartz.com',
  // No base needed - deploying to root with custom domain
  vite: {
    // Exclude old HTML directories from Vite's module resolution
    // These use importmaps which Vite doesn't understand
    // Remove this config after deleting old files post-QA
    optimizeDeps: {
      exclude: ['three'],
      // Don't scan old directories for dependencies
      entries: ['src/**/*.astro', 'src/**/*.ts', 'src/**/*.js']
    }
  }
});
