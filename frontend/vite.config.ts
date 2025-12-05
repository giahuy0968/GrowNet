import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const runtimeEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env || {}
const proxyTarget = runtimeEnv.VITE_PROXY_TARGET || 'http://localhost:4000'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        secure: false
      }
    }
  }
})
