import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Only our own unit tests — never the vendored Astro source under
    // .cloned-sources, node_modules, or the build output.
    include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'],
    exclude: ['.cloned-sources/**', 'node_modules/**', 'dist/**'],
  },
});
