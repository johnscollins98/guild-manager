import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteTsconfigPaths(), svgrPlugin(), eslint()],
  server: {
    open: true,
    port: 3001,
    proxy: {
      '/auth': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    rollupOptions: {
      onwarn: (warning, defaultHandler) => {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) {
          return;
        }

        defaultHandler(warning);
      }
    }
  }
});
