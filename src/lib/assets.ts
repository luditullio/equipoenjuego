/**
 * Rutas de los assets reutilizables.
 *
 * Los PNG de Canva se sirven tal cual desde `publicDir` (`vite.config.ts` → `publicDir: 'cartas'`),
 * sin copiarlos ni renombrarlos. Las rutas del manifiesto son relativas a esa carpeta y acá se
 * codifican para poder usarlas en el navegador con espacios, tildes y el carácter `·`.
 *
 * Los SVG provienen de `recursos/`. Si se mueve esa carpeta, este archivo es el único lugar a tocar.
 */
import formasOrganicas from '../../recursos/formas_organicas.svg?url'
import hojasEsquina from '../../recursos/hojas_esquina.svg?url'
import iconoGrupal from '../../recursos/icono_grupal.svg?url'
import iconoIndividual from '../../recursos/icono_individual.svg?url'
import iconoTeoricas from '../../recursos/icono_teoricas.svg?url'
import mazoGrupal from '../../recursos/editorial/dorso-grupal.svg?url'
import mazoIndividual from '../../recursos/editorial/dorso-individual.svg?url'
import mazoTeoricas from '../../recursos/editorial/dorso-teoricas.svg?url'

import type { DeckId } from './types'

/**
 * Convierte una ruta relativa del manifiesto en una URL válida para el navegador.
 * Codifica cada segmento por separado para no romper las barras.
 */
export function urlDeCarta(rutaRelativa: string): string {
  const normalizada = rutaRelativa.replace(/\\/g, '/').replace(/^\.?\//, '')
  return import.meta.env.BASE_URL + normalizada.split('/').map(encodeURIComponent).join('/')
}

export const SVG = {
  formasOrganicas,
  hojasEsquina,
  icono: {
    grupal: iconoGrupal,
    individual: iconoIndividual,
    teoricas: iconoTeoricas,
  } satisfies Record<DeckId, string>,
  mazo: {
    grupal: mazoGrupal,
    individual: mazoIndividual,
    teoricas: mazoTeoricas,
  } satisfies Record<DeckId, string>,
}
