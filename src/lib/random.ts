/** Utilidades de azar. La selección real no depende de la animación visual de mezcla. */

export type Rng = () => number

/** Devuelve un índice al azar en `[0, total)` o `-1` si no hay elementos. */
export function indiceAlAzar(total: number, rng: Rng = Math.random): number {
  if (total <= 0) return -1
  return Math.min(total - 1, Math.floor(rng() * total))
}

/** Elige un elemento al azar de la lista (sin repetir criterio: la lista ya viene filtrada). */
export function elegirAlAzar<T>(elementos: readonly T[], rng: Rng = Math.random): T | null {
  const i = indiceAlAzar(elementos.length, rng)
  return i === -1 ? null : elementos[i]
}

/** Copia mezclada (Fisher-Yates) con un generador inyectable, para la animación y para los tests. */
export function mezclar<T>(elementos: readonly T[], rng: Rng = Math.random): T[] {
  const copia = [...elementos]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = indiceAlAzar(i + 1, rng)
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}
