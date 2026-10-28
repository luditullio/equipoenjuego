/** Detecta la preferencia del sistema de reducir movimiento. */
import { useEffect, useState } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

function leerPreferencia(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  return window.matchMedia(CONSULTA).matches
}

export function useMovimientoReducido(): boolean {
  const [reducido, setReducido] = useState<boolean>(leerPreferencia)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mq = window.matchMedia(CONSULTA)
    const alCambiar = (evento: MediaQueryListEvent) => setReducido(evento.matches)
    setReducido(mq.matches)
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', alCambiar)
      return () => mq.removeEventListener('change', alCambiar)
    }
    // Navegadores viejos.
    mq.addListener(alCambiar)
    return () => mq.removeListener(alCambiar)
  }, [])

  return reducido
}
