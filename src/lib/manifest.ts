/** Acceso al manifiesto de cartas y su validación. */
import datos from '../data/cards.json'
import { ORDEN_MAZOS, type Carta, type DeckId, type ManifiestoCartas, type ResultadoValidacion } from './types'

export const manifiesto = datos as unknown as ManifiestoCartas

/** Todas las cartas, en el orden del manifiesto. */
export const CARTAS: readonly Carta[] = manifiesto.cartas

const PREFIJO_POR_MAZO: Record<DeckId, string> = {
  grupal: 'G',
  individual: 'I',
  teoricas: 'T',
}

export function cartasDe(mazo: DeckId, cartas: readonly Carta[] = CARTAS): Carta[] {
  return cartas.filter((carta) => carta.deck === mazo)
}

export function infoDeMazo(mazo: DeckId) {
  return manifiesto.mazos.find((m) => m.id === mazo)
}

export function cartaPorId(id: string, cartas: readonly Carta[] = CARTAS): Carta | undefined {
  return cartas.find((carta) => carta.id === id)
}

/** Cartas cuya pareja de caras quedó deducida y falta confirmar visualmente. */
export function cartasPorConfirmar(cartas: readonly Carta[] = CARTAS): Carta[] {
  return cartas.filter((carta) => carta.asociacionPorConfirmar === true)
}

/**
 * Valida la estructura del manifiesto (no toca el sistema de archivos).
 * Los errores indican que la app no puede mostrar el juego completo;
 * las advertencias indican faltantes o datos provisorios a revisar.
 */
export function validarManifiesto(m: ManifiestoCartas = manifiesto): ResultadoValidacion {
  const errores: string[] = []
  const advertencias: string[] = []
  const resumen: ResultadoValidacion['resumen'] = []

  const vistos = new Set<string>()
  for (const carta of m.cartas) {
    if (!carta.id) {
      errores.push('Hay una carta sin ID en el manifiesto.')
      continue
    }
    if (vistos.has(carta.id)) errores.push(`El ID ${carta.id} está repetido en el manifiesto.`)
    vistos.add(carta.id)

    const prefijoEsperado = PREFIJO_POR_MAZO[carta.deck]
    if (!prefijoEsperado) {
      errores.push(`La carta ${carta.id} declara un mazo desconocido: ${String(carta.deck)}.`)
      continue
    }
    if (!carta.id.startsWith(prefijoEsperado)) {
      errores.push(`La carta ${carta.id} no respeta el prefijo del mazo ${carta.deck} (se esperaba «${prefijoEsperado}»).`)
    }
    if (!Number.isInteger(carta.numero) || carta.numero < 1) {
      errores.push(`La carta ${carta.id} no tiene un número de orden válido.`)
    }
    if (!carta.coverImage || !carta.contentImage) {
      errores.push(`La carta ${carta.id} no declara ambas caras (coverImage / contentImage).`)
    } else if (carta.coverImage === carta.contentImage) {
      errores.push(`La carta ${carta.id} usa la misma imagen para las dos caras.`)
    } else {
      const carpeta = m.carpetas?.[carta.deck]
      if (carpeta && !carta.coverImage.startsWith(carpeta + '/')) {
        errores.push(`La cara ilustrada de ${carta.id} no está en la carpeta del mazo (${carpeta}).`)
      }
      if (carpeta && !carta.contentImage.startsWith(carpeta + '/')) {
        errores.push(`El contenido de ${carta.id} no está en la carpeta del mazo (${carpeta}).`)
      }
    }
  }

  for (const mazo of ORDEN_MAZOS) {
    const info = m.mazos.find((x) => x.id === mazo)
    const encontradas = cartasDe(mazo, m.cartas)
    const declaradas = info?.cartas ?? 0
    resumen.push({ mazo, declaradas, encontradas: encontradas.length })

    if (!info) {
      errores.push(`El mazo ${mazo} no está declarado en el manifiesto.`)
      continue
    }
    if (!m.carpetas?.[mazo]) errores.push(`El mazo ${mazo} no declara su carpeta de imágenes.`)
    if (encontradas.length !== declaradas) {
      errores.push(`El mazo ${mazo} declara ${declaradas} cartas pero el manifiesto tiene ${encontradas.length}.`)
    }

    const numeros = encontradas.map((c) => c.numero).sort((a, b) => a - b)
    for (let i = 0; i < numeros.length; i++) {
      if (numeros[i] !== i + 1) {
        advertencias.push(`La numeración del mazo ${mazo} no es continua desde 1 (falta el ${i + 1}).`)
        break
      }
    }
  }

  const porConfirmar = cartasPorConfirmar(m.cartas)
  if (porConfirmar.length > 0) {
    advertencias.push(
      `Hay ${porConfirmar.length} cartas con la pareja de caras por confirmar: ${porConfirmar
        .map((c) => c.id)
        .join(', ')}.`,
    )
  }

  return { errores, advertencias, resumen }
}
