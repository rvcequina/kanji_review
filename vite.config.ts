import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' makes asset URLs relative, so the build works on GitHub Pages
// under /<repo-name>/ as well as at a domain root. (No client-side router is used.)
export default defineConfig({
  base: './',
  plugins: [react()],
});
