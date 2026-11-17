import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
  plugins: [
    // 1. Initialize polyfills FIRST
    nodePolyfills({
      globals: {
        Buffer: true, 
        global: true,
        process: true,
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      // 2. Explicitly map the paths that are failing during the Rollup build
      'vite-plugin-node-polyfills/shims/process': 'vite-plugin-node-polyfills/shims/process',
      'vite-plugin-node-polyfills/shims/buffer': 'vite-plugin-node-polyfills/shims/buffer',
    },
  },
  build: {
    rollupOptions: {
      // 3. Ensure these are not treated as external modules
      external: [],
    },
    commonjsOptions: {
      // 4. Required for ZegoCloud's internal module structure
      transformMixedEsModules: true,
    },
  },
});