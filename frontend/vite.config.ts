import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/**
 * Vite-Konfiguration
 * - react Plugin für React-Unterstützung
 * - Alias '@' für einfachere Imports (statt '../../src/...' kann '@/...' verwendet werden)
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})


