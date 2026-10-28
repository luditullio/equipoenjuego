import { describe, expect, it } from 'vitest'
import {
  idsTeoricasRelacionadas,
  relacionDe,
  relacionesDesdeTexto,
  relacionesPorDefecto,
  teoricasRelacionadas,
  validarRelaciones,
} from './links'
import { CARTAS, cartasDe } from './manifest'
import type { RelacionPracticaTeorica } from './types'

const relaciones: RelacionPracticaTeorica[] = [
  { practica: 'G01', teoricas: ['T01'], provisorio: true },
  { practica: 'I01', teoricas: ['T01', 'T02'], provisorio: true },
]

describe('lectura de vínculos', () => {
  it('una carta sin vínculo declarado no tiene Teóricas relacionadas', () => {
    expect(idsTeoricasRelacionadas(relaciones, 'G02')).toEqual([])
    expect(teoricasRelacionadas(relaciones, 'G02')).toEqual([])
    expect(relacionDe(relaciones, 'G02')).toBeUndefined()
  })

  it('resuelve una Teórica relacionada contra el manifiesto', () => {
    const vinculadas = teoricasRelacionadas(relaciones, 'G01', CARTAS)
    expect(vinculadas.map((c) => c.id)).toEqual(['T01'])
    expect(vinculadas[0].deck).toBe('teoricas')
  })

  it('admite varias Teóricas por carta práctica', () => {
    expect(idsTeoricasRelacionadas(relaciones, 'I01')).toEqual(['T01', 'T02'])
    expect(teoricasRelacionadas(relaciones, 'I01', CARTAS)).toHaveLength(2)
  })
})

describe('lectura desde texto (pantalla de administración)', () => {
  it('acepta un array suelto', () => {
    const { relaciones: leidas, errores } = relacionesDesdeTexto('[{"practica":"G01","teoricas":["T01"]}]')
    expect(errores).toEqual([])
    expect(leidas).toHaveLength(1)
    expect(leidas[0]).toMatchObject({ practica: 'G01', teoricas: ['T01'] })
  })

  it('acepta un objeto con la propiedad «relaciones»', () => {
    const { relaciones: leidas, errores } = relacionesDesdeTexto('{"relaciones":[{"practica":"I01","teoricas":[]}]}')
    expect(errores).toEqual([])
    expect(leidas).toHaveLength(1)
    expect(leidas[0].teoricas).toEqual([])
  })

  it('informa un error cuando el JSON no se puede leer', () => {
    const { relaciones: leidas, errores } = relacionesDesdeTexto('{no es json')
    expect(leidas).toEqual([])
    expect(errores).toHaveLength(1)
  })

  it('descarta entradas con forma inválida', () => {
    const { relaciones: leidas } = relacionesDesdeTexto('[{"practica":42},{"practica":"G01","teoricas":["T01"]}]')
    expect(leidas).toHaveLength(1)
  })
})

describe('validación de la curaduría', () => {
  it('detecta vínculos hacia cartas inexistentes', () => {
    const errores = validarRelaciones([{ practica: 'G99', teoricas: ['T99'] }], CARTAS)
    expect(errores.length).toBeGreaterThan(0)
    expect(errores.join(' ')).toMatch(/G99/)
  })

  it('exige que el vínculo parta de una carta Grupal o Individual', () => {
    const errores = validarRelaciones([{ practica: 'T01', teoricas: ['T02'] }], CARTAS)
    expect(errores.join(' ')).toMatch(/Grupal o Individual/)
  })

  it('exige que el destino sea una carta Teórica', () => {
    const errores = validarRelaciones([{ practica: 'G01', teoricas: ['G02'] }], CARTAS)
    expect(errores.join(' ')).toMatch(/no es una carta Teórica/)
  })
})

describe('curaduría provisoria del archivo (src/data/links.json)', () => {
  const curadas = relacionesPorDefecto()
  const practicas = [...cartasDe('grupal', CARTAS), ...cartasDe('individual', CARTAS)].map((c) => c.id)

  it('cubre las 45 prácticas (G01–G30 e I01–I15) con IDs únicos', () => {
    expect(practicas).toHaveLength(45)
    expect(curadas).toHaveLength(45)
    const ids = curadas.map((r) => r.practica)
    expect(new Set(ids).size).toBe(45)
    expect([...ids].sort()).toEqual([...practicas].sort())
  })

  it('mantiene las ocho listas vacías deliberadas', () => {
    const vacias = curadas
      .filter((r) => r.teoricas.length === 0)
      .map((r) => r.practica)
      .sort()
    expect(vacias).toEqual(['G09', 'G15', 'G16', 'G17', 'G19', 'G30', 'I09', 'I13'])
  })

  it('apunta solo a Teóricas existentes y sin destinos duplicados', () => {
    expect(validarRelaciones(curadas, CARTAS)).toEqual([])
    for (const relacion of curadas) {
      expect(new Set(relacion.teoricas).size).toBe(relacion.teoricas.length)
      expect(relacion.teoricas.every((t) => /^T(0[1-9]|1[0-6])$/.test(t))).toBe(true)
    }
  })

  it('conserva los vínculos clave de la revisión', () => {
    const de = (id: string) => curadas.find((r) => r.practica === id)?.teoricas
    expect(de('G01')).toEqual(['T02', 'T03'])
    expect(de('G02')).toEqual(['T02'])
    expect(de('G13')).toEqual(['T10'])
    expect(de('G18')).toEqual(['T12'])
    expect(de('G21')).toEqual(['T16'])
    expect(de('G26')).toEqual(['T07'])
    expect(de('G28')).toEqual(['T03', 'T08'])
    expect(de('I01')).toEqual(['T01', 'T11'])
    expect(de('I11')).toEqual(['T13'])
    expect(de('I12')).toEqual(['T11'])
    expect(de('I13')).toEqual([])
    expect(de('I14')).toEqual(['T15'])
  })

  it('marca la curaduría como definitiva (sin aviso de vínculo a confirmar)', () => {
    expect(curadas.every((r) => r.provisorio === false)).toBe(true)
  })
})
