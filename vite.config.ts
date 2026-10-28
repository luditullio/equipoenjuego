// `defineConfig` se importa de 'vitest/config' para que TypeScript reconozca la
// clave `test`. Es el mismo objeto que el de Vite más los tipos de Vitest.
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// `publicDir: 'cartas'` sirve los PNG exportados de Canva TAL CUAL, sin copiarlos
// ni renombrarlos. Las rutas con espacios, tildes y el carácter `—` quedan
// disponibles como `/equipo en juego_mazo grupal/G01 — Frente.png`
// (codificadas por `urlDeCarta()` en `src/lib/assets.ts`).
// Si algún día se mueven las imágenes a otra carpeta, alcanza con cambiar esta
// línea y las rutas del manifiesto `src/data/cards.json`.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' && process.env.GITHUB_ACTIONS ? '/equipoenjuego/' : '/',
  plugins: [react()],
  publicDir: 'cartas',
  server: {
    port: 5173,
    strictPort: false,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    include: ['src/**/*.test.{ts,tsx}'],
  },
}))
