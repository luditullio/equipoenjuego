import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import App from './App'
import { presentacionDe } from './lib/mazos'
import { TITULOS_TEORICAS } from './lib/editorial'

describe('sistema editorial aprobado', () => {
  it('usa verde, lavanda y terracota para las categorías correctas', () => {
    expect(presentacionDe('grupal').color).toBe('#164C43')
    expect(presentacionDe('individual').color).toBe('#69507E')
    expect(presentacionDe('teoricas').color).toBe('#B9492B')
  })
  it('el encabezado no agrega el contador 61 cartas a la marca', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /^Equipo en juego$/ })).toBeInTheDocument()
    expect(document.querySelector('.marca small')).toBeNull()
  })
  it('reúne los tres mazos en un solo selector', () => {
    render(<App />)
    expect(document.querySelectorAll('.mazos .mazo')).toHaveLength(3)
    expect(document.querySelector('.modalidades')).toBeNull()
  })
  it('el tutorial mezcla Grupal y revela un frente real Grupal', () => {
    render(<App />)
    const backs = document.querySelectorAll('.tutorial__mezclar img')
    expect(backs).toHaveLength(3)
    backs.forEach(b => expect(b.getAttribute('src')).toContain('dorso-grupal.svg'))
    expect(document.querySelector('.tutorial__revelar img')?.getAttribute('src')).toContain('G13%20%E2%80%94%20Frente.png')
  })
  it('los dorsos son SVG independientes sin etiquetas superpuestas', () => {
    for (const [mazo, nombre] of [['grupal','GRUPAL'],['individual','INDIVIDUAL'],['teoricas','TEÓRICAS']]) {
      const svg = readFileSync(`recursos/editorial/dorso-${mazo}.svg`, 'utf8')
      expect(svg).toContain(`>${nombre}</text>`)
      // Un único fondo con relleno; el maletín puede tener un rectángulo de trazo.
      expect(svg.match(/<rect [^>]*fill=/g)).toHaveLength(1)
      expect(svg).not.toContain('linearGradient')
    }
  })
  it('tiene exactamente los 16 rótulos de biblioteca, en orden', () => {
    expect(Object.keys(TITULOS_TEORICAS)).toEqual(Array.from({length:16},(_,i)=>`T${String(i+1).padStart(2,'0')}`))
  })
})
