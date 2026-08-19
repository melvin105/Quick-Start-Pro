/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Serve on all network interfaces (not just localhost) so a phone on the same
  // Wi‑Fi can load the app + scan-to-register QR links (VITE_APP_URL uses the LAN IP).
  server: { host: true },
  test: {
    // Node environment is enough for the current suite (pure presenter logic
    // and service functions over a mocked Axios client). Switch to 'jsdom' when
    // component/hook tests are added.
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
