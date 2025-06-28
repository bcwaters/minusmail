// email-frontend/vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/email': {
          target: env.VITE_API_BASE_URL || 'http://localhost:3000',
          changeOrigin: true,
        },
        '/socket.io': {
          target: env.VITE_WS_BASE_URL || 'http://localhost:3000',
          ws: true,
          changeOrigin: true,
        },
      },
    },
  };
});