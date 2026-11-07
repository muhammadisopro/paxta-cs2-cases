import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
// @ts-ignore
import { createApiMiddleware } from './server-api.js';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'paxtabox-api-server',
      configureServer(server) {
        server.middlewares.use(createApiMiddleware());
      },
    },
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
