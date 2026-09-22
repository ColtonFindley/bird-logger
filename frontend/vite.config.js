import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // any request starting with /api gets forwarded to backend  
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        // strips the /api prefix on the call
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
