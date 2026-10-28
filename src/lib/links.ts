/**
 * Vínculos entre cartas prácticas (G/I) y cartas Teóricas (T).
 * Curaduría DEFINITIVA (aprobada el 2026-10-28): las relaciones del archivo
 * llevan `provisorio: false`. Editable desde `src/data/links.json` o desde la
 * pantalla de administración. Independiente de los nombres de archivo.
 */
import archivo from '../data/links.json'
import { CARTAS } from './manifest'
import type { ArchivoLinks, Carta, RelacionPracticaTeorica } from './types'

export const archivoLinks = archivo as unknown as ArchivoLinks

/** Relaciones vigentes (por defecto, las del archivo). */
export function relacionesPorDefecto(): RelacionPracticaTeorica[] {
  return archivoLinks.relaciones ?? []
}

/** Lee un JSON de vínculos pegado a mano (pantalla de administración) y valida su forma. */
export function relacionesDesdeTexto(
  texto: string,
): { relaciones: RelacionPracticaTeorica[]; errores: string[] } {
  let crudo: unknown
  try {
    crudo = JSON.parse(texto)
  } catch (error) {
    return { relaciones: [], errores: [`El JSON no se puede leer: ${(error as Error).message}`] }
  }
  const lista = Array.isArray(crudo)
    ? crudo
    : (crudo as { relaciones?: unknown } | null)?.relaciones
  if (!Array.isArray(lista)) {
    return { relaciones: [], errores: ['El JSON debe tener una propiedad «relaciones» con un array.'] }
  }
  return { relaciones: normalizarRelaciones(lista), errores: [] }
}

function normalizarRelaciones(lista: unknown[]): RelacionPracticaTeorica[] {
  const salida: RelacionPracticaTeorica[] = []
  for (const item of lista) {
    if (!item || typeof item !== 'object') continue
    const { practica, teoricas, provisorio, nota } = item as Partial<RelacionPracticaTeorica>
    if (typeof practica !== 'string' || !Array.isArray(teoricas)) continue
    salida.push({
      practica,
      teoricas: teoricas.filter((t): t is string => typeof t === 'string'),
      provisorio: provisorio === true,
      nota: typeof nota === 'string' ? nota : undefined,
    })
  }
  return salida
}

/** IDs de Teóricas vinculadas a una carta práctica (0, 1 o varias). */
export function idsTeoricasRelacionadas(
  relaciones: readonly RelacionPracticaTeorica[],
  cartaId: string,
): string[] {
  const relacion = relaciones.find((r) => r.practica === cartaId)
  return relacion ? [...relacion.teoricas] : []
}

export function relacionDe(
  relaciones: readonly RelacionPracticaTeorica[],
  cartaId: string,
): RelacionPracticaTeorica | undefined {
  return relaciones.find((r) => r.practica === cartaId)
}

/** Cartas Teóricas vinculadas, ya resueltas contra el manifiesto. */
export function teoricasRelacionadas(
  relaciones: readonly RelacionPracticaTeorica[],
  cartaId: string,
  cartas: readonly Carta[] = CARTAS,
): Carta[] {
  return idsTeoricasRelacionadas(relaciones, cartaId)
    .map((id) => cartas.find((c) => c.id === id))
    .filter((c): c is Carta => Boolean(c))
}

/** Errores de curaduría: IDs de prácticas o Teóricas que no existen en el manifiesto. */
export function validarRelaciones(
  relaciones: readonly RelacionPracticaTeorica[],
  cartas: readonly Carta[] = CARTAS,
): string[] {
  const porId = new Map(cartas.map((c) => [c.id, c]))
  const errores: string[] = []
  for (const relacion of relaciones) {
    const practica = porId.get(relacion.practica)
    if (!practica) {
      errores.push(`El vínculo apunta a una carta práctica inexistente: ${relacion.practica}.`)
      continue
    }
    if (practica.deck === 'teoricas') {
      errores.push(`El vínculo de ${relacion.practica} debería partir de una carta Grupal o Individual.`)
    }
    for (const id of relacion.teoricas) {
      const teorica = porId.get(id)
      if (!teorica) errores.push(`El vínculo ${relacion.practica} → ${id} apunta a una Teórica inexistente.`)
      else if (teorica.deck !== 'teoricas') errores.push(`El vínculo ${relacion.practica} → ${id} no es una carta Teórica.`)
    }
  }
  return errores
}
