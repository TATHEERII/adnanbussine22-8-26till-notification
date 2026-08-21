import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During local `vite` dev the Cloudflare Worker (API) runs on a different
// origin (wrangler dev, default http://localhost:8787). Proxy /api to it so
// the frontend can reach the backend without CORS issues while developing.
// In production the same Worker serves both the static assets and /api, so no
// proxy is needed and VITE_API_URL stays empty (same origin).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
