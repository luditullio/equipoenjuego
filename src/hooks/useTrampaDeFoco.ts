/**
 * Foco encerrado dentro de un diálogo: enfoca el primer elemento al abrir,
 * cicla con Tab/Shift+Tab, cierra con Escape y devuelve el foco al cerrar.
 */
import { useEffect, type RefObject } from 'react'

const SELECTOR_ENFOCABLES =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function useTrampaDeFoco(
  contenedor: RefObject<HTMLElement | null>,
  activo: boolean,
  onCerrar: () => void,
): void {
  useEffect(() => {
    if (!activo) return
    const nodo = contenedor.current
    const previo = document.activeElement as HTMLElement | null

    const enfocables = () =>
      Array.from(nodo?.querySelectorAll<HTMLElement>(SELECTOR_ENFOCABLES) ?? []).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      )

    const primero = enfocables()[0]
    ;(primero ?? nodo)?.focus()

    const alPresionar = (evento: KeyboardEvent) => {
      // Un visor puede abrirse sobre una ficha: solo el diálogo superior responde.
      const dialogos = document.querySelectorAll('[aria-modal="true"]')
      if (dialogos.length && dialogos[dialogos.length - 1] !== nodo) return
      if (evento.key === 'Escape') {
        evento.stopPropagation()
        onCerrar()
        return
      }
      if (evento.key !== 'Tab') return
      const lista = enfocables()
      if (lista.length === 0) return
      const primeroLista = lista[0]
      const ultimoLista = lista[lista.length - 1]
      const focoActual = document.activeElement
      if (evento.shiftKey && (focoActual === primeroLista || focoActual === nodo)) {
        evento.preventDefault()
        ultimoLista.focus()
      } else if (!evento.shiftKey && focoActual === ultimoLista) {
        evento.preventDefault()
        primeroLista.focus()
      }
    }

    document.addEventListener('keydown', alPresionar)
    return () => {
      document.removeEventListener('keydown', alPresionar)
      previo?.focus?.()
    }
  }, [contenedor, activo, onCerrar])
}
