
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
      '/watchlist/': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      },
      '/sectors/': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      },
      '/industries/': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      },
      '/custom-collections/': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      },
      '/custom-collection': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          const path = req.url || '';
          if (/^\/custom-collection\/\d+\/?$/.test(path) && !req.headers['x-user-id']) {
            return '/index.html';
          }
          return null;
        }
      },
      '/stocks/getfilteredstocks': {
        target: 'http://api:8000',
        changeOrigin: true,
        secure: false,
      }
    },
  },
})
