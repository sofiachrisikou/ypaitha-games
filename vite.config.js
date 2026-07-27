import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Portrait kiosk app. Άνοιξέ το full-screen στην οθόνη 1080x1920.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
