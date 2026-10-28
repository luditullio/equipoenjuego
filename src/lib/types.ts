/** Tipos compartidos del dominio de cartas. */

/** Identificadores estables de los mazos. Nunca renombrar: se usan en el progreso guardado. */
export type DeckId = 'grupal' | 'individual' | 'teoricas'

/** Orden de presentación de los mazos en la interfaz. */
export const ORDEN_MAZOS: readonly DeckId[] = ['grupal', 'individual', 'teoricas']

/**
 * Una carta del juego.
 * - `coverImage`: cara ilustrada. Es la primera que ve el jugador (la tapa).
 * - `contentImage`: cara con instrucciones o contenido, se revela al dar vuelta.
 * El nombre físico del archivo (`Frente`/`Dorso`) NO define este orden.
 */
export interface Carta {
  id: string
  deck: DeckId
  numero: number
  coverImage: string
  contentImage: string
  /** `true` cuando la pareja de caras se armó por deducción y falta confirmarla visualmente. */
  asociacionPorConfirmar?: boolean
  nota?: string
  /**
   * Texto alternativo opcional de cada cara. Las caras son imágenes con texto
   * incrustado, así que sin estos campos un lector de pantalla solo anuncia el
   * ID y el estado de la carta.
   */
  altCover?: string
  altContent?: string
}

export interface MazoInfo {
  id: DeckId
  nombre: string
  cartas: number
  descripcion: string
  juegoConReportes: boolean
}

export interface ManifiestoCartas {
  version: string
  actualizado: string
  nota: string
  carpetas: Record<DeckId, string>
  mazos: MazoInfo[]
  cartas: Carta[]
}

/** Vínculo entre una carta práctica (G/I) y una o varias cartas Teóricas. */
export interface RelacionPracticaTeorica {
  practica: string
  teoricas: string[]
  /** `true` mientras la curaduría no esté cerrada. La interfaz lo advierte. */
  provisorio?: boolean
  nota?: string
}

export interface ArchivoLinks {
  version: string
  actualizado: string
  _nota?: string
  _formato?: Record<string, string>
  relaciones: RelacionPracticaTeorica[]
}

export interface FaltantesMazo {
  mazo: DeckId
  declaradas: number
  encontradas: number
}

export interface ResultadoValidacion {
  errores: string[]
  advertencias: string[]
  resumen: FaltantesMazo[]
}
