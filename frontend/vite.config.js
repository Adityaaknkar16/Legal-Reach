import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    // This MUST come before react()
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
        process: true, // This is what ZegoCloud is missing
      },
    }),
    react(),
  ],
  resolve: {
    alias: {
      // Force resolution of the specific shim path mentioned in your error
      'vite-plugin-node-polyfills/shims/process': 'vite-plugin-node-polyfills/shims/process',
    }
  }
})