import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  assetsInclude: ['**/*.md'],
  server: {
    proxy: {
      '/api': 'http://localhost:5135',
      '/uploads': 'http://localhost:5135'
    }
  }
});
