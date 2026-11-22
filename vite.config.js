import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import searchMetadata from './vite-seo.js'

export default defineConfig({
  plugins: [react(), searchMetadata()],
})
