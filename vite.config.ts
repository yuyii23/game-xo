import { fileURLToPath, URL } from 'url';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  css: {
    preprocessorOptions: {
      scss: {}
    }
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  optimizeDeps: {
    include: ['axios'],
    entries: [
      './src/**/*.vue',
      './src/**/*.ts',
      './src/**/*.d.ts',
      './src/**/*.tsx',
      './src/**/*.vue',
      './src/components/**/*.ts',
      './src/components/**/*.vue'
    ]
  }
})
