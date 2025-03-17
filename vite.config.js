import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  server: {
    open: false,
    hmr: {
      overlay: true
    }
  },
  build: {
    outDir: 'dist',
    minify: true,
  },
  // Явно указываем точку входа
  root: './',
  publicDir: 'public',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});