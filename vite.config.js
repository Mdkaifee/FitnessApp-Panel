import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// const API_PROXY_TARGET = 'http://localhost:8000'
const API_PROXY_TARGET = 'https://dev-api.glowante.com'
const API_PROXY_PATHS = []
const proxyConfig = API_PROXY_PATHS.reduce((acc, path) => {
  acc[path] = {
    target: API_PROXY_TARGET,
    changeOrigin: true,
  }
  return acc
}, {})

const fseventsStubPlugin = {
  name: 'vite:fsevents-stub',
  enforce: 'pre',
  resolveId(source) {
    if (source === 'fsevents') {
      return '\0fsevents-stub'
    }
    return null
  },
  load(id) {
    if (id === '\0fsevents-stub') {
      return `
        export const watch = () => ({
          stop() {},
        });
        export default { watch };
      `
    }
    return null
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [fseventsStubPlugin, react()],
  optimizeDeps: {
    exclude: ['fsevents'],
  },
  ssr: {
    external: ['fsevents'],
  },
  server: {
    allowedHosts: ['*'],
    proxy: proxyConfig,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
    clearMocks: true,
  },
})
