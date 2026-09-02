import { defineConfig } from 'vite';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  // Base path for GitHub Pages deployment at /jxl-art/
  base: process.env.BASE_PATH || '/',
  plugins: [wasm(), topLevelAwait()],
  build: {
    target: 'esnext',
  },
  worker: {
    format: 'es',
    plugins: () => [wasm(), topLevelAwait()],
  },
});
