import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: base must match your GitHub repo name for GitHub Pages.
export default defineConfig({
  plugins: [react()],
  base: '/punthub-beta/',
})
