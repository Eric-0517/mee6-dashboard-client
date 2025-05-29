import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mee6-dashboard-client/', // GitHub Pages 用的路徑前綴
})
