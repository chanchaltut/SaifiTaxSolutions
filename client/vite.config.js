import fs from 'node:fs';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

/** Serve admin.html for every /admin/... address (the admin panel is its own small app). */
const adminRoutes = () => {
  const rewrite = (req, res, next) => {
    if (req.url && /^\/admin(\/[^.]*)?(\?.*)?$/.test(req.url)) req.url = '/admin.html';
    next();
  };
  return {
    name: 'saifi-admin-routes',
    configureServer: (server) => { server.middlewares.use(rewrite); },
    configurePreviewServer: (server) => { server.middlewares.use(rewrite); },
  };
};

/* Share images in public/og/, so pages without their own image fall back to a general one. */
const ogFiles = fs.existsSync('public/og')
  ? fs.readdirSync('public/og').filter((f) => f.endsWith('.png')).map((f) => `/og/${f}`)
  : [];

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '');
  /* With no VITE_API_URL, "/api" is forwarded to the server running on this computer. */
  const proxy = env.VITE_API_URL ? undefined : { '/api': { target: env.DEV_API_TARGET || 'http://localhost:4000', changeOrigin: false } };
  return {
    plugins: [react(), adminRoutes()],
    define: { __OG_FILES__: JSON.stringify(ogFiles) },
    server: { proxy },
    preview: { proxy },
    build: {
      emptyOutDir: true,
      /* One stylesheet per page (site and admin), never mixed. */
      cssCodeSplit: true,
      assetsInlineLimit: 0,
      manifest: false,
      rollupOptions: isSsrBuild ? undefined : { input: { main: 'index.html', admin: 'admin.html' } },
    },
    ssr: {
      noExternal: ['wouter', 'lucide-react'],
    },
  };
});
