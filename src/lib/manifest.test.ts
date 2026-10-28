import { describe, expect, it } from 'vitest'
import { relacionesPorDefecto, validarRelaciones } from './links'
import { CARTAS, cartasDe, cartasPorConfirmar, validarManifiesto } from './manifest'

describe('manifiesto de cartas', () => {
  it('valida sin errores', () => {
    const resultado = validarManifiesto()
    expect(resultado.errores).toEqual([])
  })

  it('declara 30 cartas Grupales, 15 Individuales y 16 Teóricas', () => {
    const resumen = validarManifiesto().resumen
    expect(resumen.find((f) => f.mazo === 'grupal')).toMatchObject({ declaradas: 30, encontradas: 30 })
    expect(resumen.find((f) => f.mazo === 'individual')).toMatchObject({ declaradas: 15, encontradas: 15 })
    expect(resumen.find((f) => f.mazo === 'teoricas')).toMatchObject({ declaradas: 16, encontradas: 16 })
    expect(CARTAS).toHaveLength(61)
  })

  it('cada carta tiene dos caras distintas y dentro de la carpeta de su mazo', () => {
    for (const carta of CARTAS) {
      expect(carta.coverImage).not.toBe(carta.contentImage)
      expect(carta.coverImage.startsWith('equipo en juego')).toBe(true)
      expect(carta.contentImage.startsWith('equipo en juego')).toBe(true)
    }
  })

  it('no deja ninguna pareja de caras por confirmar: los nombres son definitivos', () => {
    expect(cartasPorConfirmar()).toHaveLength(0)
  })

  it('el mazo Teóricas se declara como consulta, sin reportes', () => {
    const info = cartasDe('teoricas')
    expect(info).toHaveLength(16)
    const declaracion = validarManifiesto().resumen.find((f) => f.mazo === 'teoricas')
    expect(declaracion?.encontradas).toBe(16)
  })
})

describe('vínculos entre cartas (curaduría definitiva)', () => {
  it('los vínculos por defecto apuntan a cartas existentes', () => {
    const relaciones = relacionesPorDefecto()
    expect(relaciones.length).toBeGreaterThan(0)
    expect(relaciones.every((r) => r.provisorio === false)).toBe(true)
    expect(validarRelaciones(relaciones)).toEqual([])
  })
})
