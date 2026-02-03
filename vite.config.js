import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/kaegro': {
        target: 'https://www.kaegro.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kaegro/, '')
      }
    }
  }
})
