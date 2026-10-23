import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/openfn-3-poc/',
  plugins: [react(), tailwindcss()],
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    // Testing Library unmounts between tests only when afterEach is global.
    globals: true,
  },
})
