import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (
            id.includes('/node_modules/react/') ||
            id.includes('/node_modules/react-dom/') ||
            id.includes('/node_modules/scheduler/')
          ) {
            return 'vendor-react'
          }

          if (
            id.includes('/node_modules/react-router/') ||
            id.includes('/node_modules/react-router-dom/') ||
            id.includes('/node_modules/@remix-run/')
          ) {
            return 'vendor-router'
          }

          if (id.includes('recharts') || id.includes('d3') || id.includes('victory-vendor')) {
            return 'vendor-charts'
          }

          if (id.includes('axios')) {
            return 'vendor-axios'
          }
        },
      },
    },
  },
})
