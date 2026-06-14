import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Change 'habit-tracker' to your GitHub repo name
export default defineConfig({
  plugins: [react()],
  base: '/habit-tracker/',
})
