
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),
    tailwindcss(),
  ],
  clearScreen: false,
  server: {
    watch: {
      usePolling: true,
      interval: 10
    },
    proxy: {
      '/getStockInfo/': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
