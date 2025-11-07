import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Ini akan mencocokkan semua panggilan yang dimulai dengan /api/v3
      '/api/v3': {
        // Ini adalah target yang benar
        target: 'https://api.coingecko.com/api/v3',
        changeOrigin: true,
        secure: false,
        // Ini menulis ulang path dengan benar, menghapus /api/v3
        rewrite: (path) => path.replace(/^\/api\/v3/, ''),
      },
    },
  },
})
