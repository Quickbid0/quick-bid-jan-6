import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@pages': path.resolve(__dirname, './src/pages'),
    },
  },
  build: {
    target: 'esnext',
    minify: 'terser',
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
          charts: ['chart.js', 'react-chartjs-2', 'recharts'],
          forms: ['react-hook-form', '@hookform/resolvers'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/${facadeModuleId.replace(/\.[^.]*$/, '')}-[hash].js`;
        },
      },
    },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    historyApiFallback: true,
    port: 5173,
    host: true,
  },
  proxy: {
    '/api/images': {
      target: 'http://localhost:4011',
      changeOrigin: true,
    },
    '/api/rbac': {
      target: 'http://localhost:4011',
      changeOrigin: true,
    },
    '/api': {
      target: 'http://localhost:4011',
      changeOrigin: true,
    },
    '/webhooks': {
      target: 'http://localhost:4011',
      changeOrigin: true,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@headlessui/react',
      '@heroicons/react',
      'framer-motion',
    ],
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  esbuild: {
    tsconfigRaw: {
      compilerOptions: {
        noEmit: false,
        strict: false,
        noImplicitAny: false,
        skipLibCheck: true,
      },
    },
  },
});
