import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    emptyOutDir: true,
    cssCodeSplit: false,
    assetsInlineLimit: 0,
    manifest: false,
  },
  ssr: {
    noExternal: ['wouter', 'lucide-react'],
  },
});
