import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Replace 'repo-name' with your actual GitHub repository name
  // e.g., if your repo is 'my-uploader', this should be '/my-uploader/'
  base: './', 
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    proxy: {
      // Proxy API requests to backend during local development
      '/upload': 'http://localhost:3001'
    }
  }
});