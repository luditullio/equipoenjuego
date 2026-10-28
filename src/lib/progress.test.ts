import { describe, expect, it } from 'vitest'
import { CARTAS, cartasDe } from './manifest'
import {
  disponibles,
  extraerCarta,
  extraidas,
  normalizarProgreso,
  progresoVacio,
  reiniciarMazo,
  type Progreso,
} from './progress'
import { elegirAlAzar, indiceAlAzar, mezclar } from './random'

/** Generador determinista que recorre `pasos` valores distintos, siempre los mismos. */
function rngCiclico(pasos = 7) {
  let i = 0
  return () => {
    i = (i + 1) % pasos
    return i / pasos
  }
}

describe('selección al azar', () => {
  it('no repite una carta hasta agotar el mazo', () => {
    let progreso: Progreso = progresoVacio()
    const vistas = new Set<string>()
    const rng = rngCiclico()

    for (let i = 0; i < 15; i++) {
      const { progreso: nuevo, carta } = extraerCarta(progreso, 'individual', CARTAS, rng)
      expect(carta).not.toBeNull()
      expect(vistas.has(carta!.id)).toBe(false)
      vistas.add(carta!.id)
      progreso = nuevo
    }

    expect(vistas.size).toBe(15)
    expect(extraidas(progreso, 'individual')).toHaveLength(15)
  })

  it('devuelve null cuando el mazo ya se agotó y no cambia el progreso', () => {
    let progreso: Progreso = progresoVacio()
    const rng = rngCiclico()

    for (let i = 0; i < 30; i++) progreso = extraerCarta(progreso, 'grupal', CARTAS, rng).progreso
    expect(disponibles(progreso, 'grupal')).toHaveLength(0)

    const resultado = extraerCarta(progreso, 'grupal', CARTAS, rng)
    expect(resultado.carta).toBeNull()
    expect(resultado.progreso).toBe(progreso)
  })

  it('sortea entre las cartas que todavía no salieron', () => {
    // Con rng fijo en 0 siempre debería salir la primera disponible, nunca una ya extraída.
    const primera = extraerCarta(progresoVacio(), 'grupal', CARTAS, () => 0)
    const segunda = extraerCarta(primera.progreso, 'grupal', CARTAS, () => 0)
    expect(segunda.carta?.id).not.toBe(primera.carta?.id)
  })

  it('elegirAlAzar devuelve null con una lista vacía', () => {
    expect(elegirAlAzar([], () => 0)).toBeNull()
  })

  it('indiceAlAzar nunca se pasa del último índice', () => {
    expect(indiceAlAzar(3, () => 1)).toBe(2)
    expect(indiceAlAzar(0, () => 0)).toBe(-1)
  })

  it('mezclar devuelve una permutación de la misma lista', () => {
    const original = [1, 2, 3, 4, 5]
    const mezclada = mezclar(original, rngCiclico())
    expect([...mezclada].sort()).toEqual([...original].sort())
  })
})

describe('progreso por mazo', () => {
  it('el progreso de cada mazo es independiente', () => {
    const rng = rngCiclico()
    const conGrupal = extraerCarta(progresoVacio(), 'grupal', CARTAS, rng).progreso
    const conAmbos = extraerCarta(conGrupal, 'individual', CARTAS, rng).progreso

    expect(extraidas(conAmbos, 'grupal')).toHaveLength(1)
    expect(extraidas(conAmbos, 'individual')).toHaveLength(1)
    expect(extraidas(conAmbos, 'teoricas')).toHaveLength(0)
  })

  it('reiniciar un mazo lo deja completo sin tocar los otros', () => {
    let progreso: Progreso = progresoVacio()
    const rng = rngCiclico()
    progreso = extraerCarta(progreso, 'grupal', CARTAS, rng).progreso
    progreso = extraerCarta(progreso, 'grupal', CARTAS, rng).progreso
    progreso = extraerCarta(progreso, 'individual', CARTAS, rng).progreso

    const reiniciado = reiniciarMazo(progreso, 'grupal')

    expect(extraidas(reiniciado, 'grupal')).toHaveLength(0)
    expect(disponibles(reiniciado, 'grupal')).toHaveLength(30)
    expect(extraidas(reiniciado, 'individual')).toHaveLength(1)
  })

  it('normalizarProgreso descarta IDs y mazos desconocidos', () => {
    const normalizado = normalizarProgreso({
      porMazo: { grupal: ['G01', 'NO-EXISTE'], individual: 'no-es-una-lista', teoricas: ['T16'] },
    })

    expect(normalizado.porMazo.grupal).toEqual(['G01'])
    expect(normalizado.porMazo.individual).toEqual([])
    expect(normalizado.porMazo.teoricas).toEqual(['T16'])
  })

  it('normalizarProgreso evita IDs repetidos dentro de un mazo', () => {
    const normalizado = normalizarProgreso({ porMazo: { grupal: ['G01', 'G01', 'G02'] } })
    expect(normalizado.porMazo.grupal).toEqual(['G01', 'G02'])
  })

  it('el total de cada mazo coincide con el manifiesto', () => {
    expect(cartasDe('grupal', CARTAS)).toHaveLength(30)
    expect(cartasDe('individual', CARTAS)).toHaveLength(15)
    expect(cartasDe('teoricas', CARTAS)).toHaveLength(16)
  })
})
