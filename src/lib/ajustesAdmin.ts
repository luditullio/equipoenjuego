/**
 * Ajustes que se editan desde la pantalla de administración y quedan guardados
 * SOLO en este navegador (almacenamiento local). No modifican los archivos del
 * proyecto ni ningún servidor.
 */
import { almacen } from './almacen'
import type { RelacionPracticaTeorica } from './types'

export const CLAVE_LINKS_ADMIN = 'liderazgo-en-juego/admin/links/v1'

export function leerRelacionesDeAdmin(): RelacionPracticaTeorica[] | null {
  const crudo = almacen.obtener(CLAVE_LINKS_ADMIN)
  if (!crudo) return null
  try {
    const datos: unknown = JSON.parse(crudo)
    if (Array.isArray(datos)) return datos as RelacionPracticaTeorica[]
  } catch {
    return null
  }
  return null
}

export function guardarRelacionesDeAdmin(relaciones: readonly RelacionPracticaTeorica[]): void {
  almacen.guardar(CLAVE_LINKS_ADMIN, JSON.stringify(relaciones))
}

export function borrarRelacionesDeAdmin(): void {
  almacen.borrar(CLAVE_LINKS_ADMIN)
}
