/**
 * Progreso de la partida: qué cartas ya se extrajeron en cada mazo.
 * Todo el módulo es puro (recibe y devuelve `Progreso`), salvo `leerProgreso`/`guardarProgreso`.
 */
import type { Almacen } from './almacen'
import { almacen } from './almacen'
import { CARTAS, cartasDe } from './manifest'
import { elegirAlAzar, type Rng } from './random'
import { ORDEN_MAZOS, type Carta, type DeckId } from './types'

export interface Progreso {
  version: number
  porMazo: Record<DeckId, string[]>
}

export const VERSION_PROGRESO = 1
export const CLAVE_PROGRESO = 'liderazgo-en-juego/progreso/v1'

export function progresoVacio(): Progreso {
  return {
    version: VERSION_PROGRESO,
    porMazo: { grupal: [], individual: [], teoricas: [] },
  }
}

/**
 * Normaliza lo que venga del almacenamiento: descarta mazos e IDs desconocidos
 * (por ejemplo, si el manifiesto cambió de nomenclatura) sin perder el resto.
 */
export function normalizarProgreso(valor: unknown, cartas: readonly Carta[] = CARTAS): Progreso {
  const base = progresoVacio()
  if (!valor || typeof valor !== 'object') return base

  const crudo = (valor as { porMazo?: unknown }).porMazo
  if (!crudo || typeof crudo !== 'object') return base

  const idsValidos = new Set(cartas.map((c) => c.id))
  for (const mazo of ORDEN_MAZOS) {
    const lista = (crudo as Record<string, unknown>)[mazo]
    if (!Array.isArray(lista)) continue
    const depurada = lista.filter((id): id is string => typeof id === 'string' && idsValidos.has(id))
    base.porMazo[mazo] = [...new Set(depurada)]
  }
  return base
}

export function leerProgreso(almacenamiento: Almacen = almacen): Progreso {
  const crudo = almacenamiento.obtener(CLAVE_PROGRESO)
  if (!crudo) return progresoVacio()
  try {
    return normalizarProgreso(JSON.parse(crudo))
  } catch {
    return progresoVacio()
  }
}

export function guardarProgreso(progreso: Progreso, almacenamiento: Almacen = almacen): void {
  almacenamiento.guardar(CLAVE_PROGRESO, JSON.stringify(progreso))
}

export function extraidas(progreso: Progreso, mazo: DeckId): readonly string[] {
  return progreso.porMazo[mazo] ?? []
}

/** Cartas del mazo que todavía no salieron. */
export function disponibles(
  progreso: Progreso,
  mazo: DeckId,
  cartas: readonly Carta[] = CARTAS,
): Carta[] {
  const yaSalieron = new Set(extraidas(progreso, mazo))
  return cartasDe(mazo, cartas).filter((carta) => !yaSalieron.has(carta.id))
}

/**
 * Extrae una carta al azar entre las disponibles y devuelve el progreso nuevo.
 * No repite ninguna carta del mazo hasta reiniciarlo.
 */
export function extraerCarta(
  progreso: Progreso,
  mazo: DeckId,
  cartas: readonly Carta[] = CARTAS,
  rng: Rng = Math.random,
): { progreso: Progreso; carta: Carta | null } {
  const carta = elegirAlAzar(disponibles(progreso, mazo, cartas), rng)
  if (!carta) return { progreso, carta: null }
  return {
    progreso: { ...progreso, porMazo: { ...progreso.porMazo, [mazo]: [...extraidas(progreso, mazo), carta.id] } },
    carta,
  }
}

export function reiniciarMazo(progreso: Progreso, mazo: DeckId): Progreso {
  return { ...progreso, porMazo: { ...progreso.porMazo, [mazo]: [] } }
}

export function reiniciarTodo(): Progreso {
  return progresoVacio()
}

/** Total de cartas del mazo. `progreso` se mantiene en la firma por comodidad de los llamadores. */
export function totalDeMazo(
  _progreso: Progreso,
  mazo: DeckId,
  cartas: readonly Carta[] = CARTAS,
): number {
  return cartasDe(mazo, cartas).length
}
