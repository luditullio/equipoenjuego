import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CartaEnMesa } from './CartaEnMesa'
import type { Carta } from '../lib/types'

const carta: Carta = {
  id: 'G01',
  deck: 'grupal',
  numero: 1,
  coverImage: 'equipo en juego_mazo grupal/G01 — Frente.png',
  contentImage: 'equipo en juego_mazo grupal/G01 — Dorso.png',
}

describe('CartaEnMesa (giro de la carta)', () => {
  it('primero muestra la cara ilustrada, boca abajo', () => {
    render(<CartaEnMesa carta={carta} volteada={false} onVoltear={() => {}} />)

    const boton = screen.getByRole('button', { name: /Carta G01, cara ilustrada a la vista/ })
    expect(boton).toHaveAttribute('aria-pressed', 'false')
  })

  it('al tocar la carta avisa que se quiere dar vuelta', async () => {
    const usuario = userEvent.setup()
    const onVoltear = vi.fn()
    render(<CartaEnMesa carta={carta} volteada={false} onVoltear={onVoltear} />)

    await usuario.click(screen.getByRole('button', { name: /Carta G01, cara ilustrada a la vista/ }))
    expect(onVoltear).toHaveBeenCalledTimes(1)
  })

  it('con el contenido a la vista expone el estado volteado', () => {
    render(<CartaEnMesa carta={carta} volteada onVoltear={() => {}} />)

    const boton = screen.getByRole('button', { name: /Carta G01, contenido a la vista/ })
    expect(boton).toHaveAttribute('aria-pressed', 'true')
    expect(boton.className).toMatch(/carta--volteada/)
  })

  it('advierte cuando la pareja de caras está por confirmar', () => {
    render(
      <CartaEnMesa
        carta={{ ...carta, id: 'G12', asociacionPorConfirmar: true, nota: 'Pareja a confirmar' }}
        volteada={false}
        onVoltear={() => {}}
      />,
    )
    expect(screen.getByText('caras por confirmar')).toBeInTheDocument()
  })

  it('no muestra la insignia cuando la pareja ya está confirmada', () => {
    render(<CartaEnMesa carta={carta} volteada={false} onVoltear={() => {}} />)
    expect(screen.queryByText('caras por confirmar')).not.toBeInTheDocument()
  })
})
