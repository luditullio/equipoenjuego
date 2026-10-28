/** Presentación de cada mazo: color, ícono, modalidad de uso. */
import { SVG } from './assets'
import { infoDeMazo } from './manifest'
import { ORDEN_MAZOS, type DeckId } from './types'

export interface PresentacionMazo {
  id: DeckId
  nombre: string
  cartas: number
  descripcion: string
  icono: string
  placeholder: string
  /** Color pleno del mazo (tomado de `recursos/tokens.css`). */
  color: string
  /** Tinte claro para fondos y bordes. */
  colorSuave: string
  modalidad: string
  /** El mazo Individual no se juega con reportes: no se comparte con el equipo. */
  seJuegaConReportes: boolean
}

const BASE: Record<DeckId, Omit<PresentacionMazo, 'nombre' | 'cartas' | 'descripcion' | 'seJuegaConReportes'>> = {
  grupal: {
    id: 'grupal',
    icono: SVG.icono.grupal,
    placeholder: SVG.mazo.grupal,
    color: '#164C43',
    colorSuave: '#E3E9DE',
    modalidad:
      'Se juega con el equipo presente. Se extrae una carta al azar, se lee en voz alta y se coordina la dinámica que propone.',
  },
  individual: {
    id: 'individual',
    icono: SVG.icono.individual,
    placeholder: SVG.mazo.individual,
    color: '#69507E',
    colorSuave: '#EDE5F0',
    modalidad:
      'Reflexión privada del líder. Se extrae una carta y se trabaja en solitario: no se juega con reportes ni se comparte con el equipo.',
  },
  teoricas: {
    id: 'teoricas',
    icono: SVG.icono.teoricas,
    placeholder: SVG.mazo.teoricas,
    color: '#B9492B',
    colorSuave: '#F3E2D5',
    modalidad:
      'Consulta privada del líder. No se extrae al azar: se abre la biblioteca, se elige la ficha Teórica y no afecta la partida.',
  },
}

export function presentacionDe(mazo: DeckId): PresentacionMazo {
  const info = infoDeMazo(mazo)
  return {
    ...BASE[mazo],
    nombre: info?.nombre ?? BASE[mazo].id,
    cartas: info?.cartas ?? 0,
    descripcion: info?.descripcion ?? '',
    seJuegaConReportes: info?.juegoConReportes ?? false,
  }
}

export function todasLasPresentaciones(): PresentacionMazo[] {
  return ORDEN_MAZOS.map(presentacionDe)
}
