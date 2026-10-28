/** Estado de progreso de la partida, sincronizado con el almacenamiento local. */
import { useCallback, useEffect, useState } from 'react'
import { CARTAS } from '../lib/manifest'
import {
  extraerCarta,
  guardarProgreso,
  leerProgreso,
  reiniciarMazo as reiniciarMazoPuro,
  reiniciarTodo as reiniciarTodoPuro,
  type Progreso,
} from '../lib/progress'
import type { Carta, DeckId } from '../lib/types'

export interface ApiProgreso {
  progreso: Progreso
  /** Extrae una carta al azar entre las disponibles. Devuelve `null` si el mazo se agotó. */
  extraer: (mazo: DeckId, cartas?: readonly Carta[]) => Carta | null
  reiniciarMazo: (mazo: DeckId) => void
  reiniciarTodo: () => void
}

export function useProgreso(): ApiProgreso {
  const [progreso, setProgreso] = useState<Progreso>(() => leerProgreso())

  // El progreso se guarda por mazo en almacenamiento local: sobrevive recargas y
  // cambios de mazo, y se descarta solo al reiniciar.
  useEffect(() => {
    guardarProgreso(progreso)
  }, [progreso])

  const extraer = useCallback(
    (mazo: DeckId, cartas: readonly Carta[] = CARTAS) => {
      const resultado = extraerCarta(progreso, mazo, cartas)
      setProgreso(resultado.progreso)
      return resultado.carta
    },
    [progreso],
  )

  const reiniciarMazo = useCallback((mazo: DeckId) => {
    setProgreso((actual) => reiniciarMazoPuro(actual, mazo))
  }, [])

  const reiniciarTodo = useCallback(() => {
    setProgreso(reiniciarTodoPuro())
  }, [])

  return { progreso, extraer, reiniciarMazo, reiniciarTodo }
}
