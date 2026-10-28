import hero from '../../recursos/editorial/hero-equipo.webp?url'
import grupal from '../../recursos/editorial/categoria-grupal.webp?url'
import individual from '../../recursos/editorial/categoria-individual.webp?url'
import teoricas from '../../recursos/editorial/categoria-teoricas.webp?url'
import type { DeckId } from './types'

export const ARTE = { hero, categoria: { grupal, individual, teoricas } satisfies Record<DeckId, string> }
export const BAJADA: Record<DeckId, string> = {
  grupal: 'Un espacio para conversar y construir confianza en equipo.',
  individual: 'Un espacio de reflexión personal para quien conduce.',
  teoricas: 'Herramientas para comprender y acompañar la práctica.',
}
// Rótulos externos de biblioteca. No sustituyen ni modifican los PNG de Canva.
export const TITULOS_TEORICAS: Record<string, string> = {
  T01: 'Cafecitos', T02: 'Check-in y check-out', T03: 'Escucha: cuatro niveles',
  T04: 'SBI y CNV', T05: 'Radical Candor', T06: 'Anzuelo y emociones',
  T07: 'Mentalidad de crecimiento', T08: 'Cinco disfunciones', T09: 'Tuckman',
  T10: 'Liderazgo situacional', T11: 'GROW', T12: 'Seis sombreros',
  T13: 'Vroom y decisiones', T14: 'Diversidad de estilos',
  T15: 'Cultura, Velasco y contexto', T16: 'Estilos motivacionales',
}
