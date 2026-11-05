import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: '127.0.0.1',
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false },
    },
  },
  preview: {
    port: 4174,
    host: '127.0.0.1',
    proxy: {
      '/api': { target: 'http://127.0.0.1:8787', changeOrigin: false },
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, defaultHandler) {
        // Zod v4 experimental packages contain comment annotations that Rollup flags as INVALID_ANNOTATION.
        // Rollup safely strips the comment annotation; suppress this specific upstream notice.
        if (warning.code === 'INVALID_ANNOTATION' && warning.id?.includes('node_modules/zod')) {
          return;
        }
        defaultHandler(warning);
      },
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
