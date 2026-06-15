import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths work for both local dev, GitHub Pages, and GitHack
  base: './',
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
