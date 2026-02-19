import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    dedupe: ["react", "react-dom"],
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId.replace(/\.[^.]*$/, '')}-[hash].js`;
        },
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'react';
            if (id.includes('react-router-dom')) return 'react-router';
            if (id.includes('lucide-react')) return 'lucide-react';
            if (id.includes('zustand')) return 'zustand';
            if (id.includes('html2canvas')) return 'html2canvas';
            if (id.includes('purify')) return 'purify';
            return 'vendor';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },
  esbuild: {
    // Remove tsconfigRaw to avoid conflicts
  },
});
