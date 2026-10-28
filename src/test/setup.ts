/**
 * Configuración común de los tests (jsdom).
 * Agrega los matchers de jest-dom y completa las APIs del navegador que jsdom
 * no implementa y que usan los componentes (matchMedia, scrollIntoView).
 */
import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  window.localStorage.clear()
})

if (typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (consulta: string) => ({
      matches: false,
      media: consulta,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  })
}

if (typeof Element.prototype.scrollIntoView !== 'function') {
  Element.prototype.scrollIntoView = vi.fn()
}
