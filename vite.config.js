import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const API_PROXY_TARGET = 'http://localhost:8000'
const API_PROXY_PATHS = ['/auth', '/profile', '/videos', '/questions', '/users', '/uploads', '/media']
const proxyConfig = API_PROXY_PATHS.reduce((acc, path) => {
  acc[path] = {
    target: API_PROXY_TARGET,
    changeOrigin: true,
  }
  return acc
}, {})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['8349d619bf22.ngrok-free.app', '9fb9cd6d31d0.ngrok-free.app'],
    proxy: proxyConfig,
  },
})
