import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import eslint from 'vite-plugin-eslint';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { reactVirtualized } from './src/lib/utils/react-virtualized-fix.ts';

// https://vitejs.dev/config/
export default defineConfig(config => ({
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler']
      }
    }),
    viteTsconfigPaths(),
    svgrPlugin(),
    eslint(),
    ...(config.mode === 'development' ? [checker({ typescript: true })] : []),
    reactVirtualized()
  ],
  server: {
    open: true,
    port: 3001,
    host: '0.0.0.0',
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
}));
