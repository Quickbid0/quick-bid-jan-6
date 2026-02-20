import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * FIX 28: Disable Vite Source Maps in Staging & Production
 * Source maps expose your code to users — only enable in development
 */
export default defineConfig({
  plugins: [
    react({
      babel: {
        parserOpts: {
          sourceType: 'module',
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    // ✅ FIX 28: Only generate source maps in development
    sourcemap: process.env.NODE_ENV === 'development',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
});
