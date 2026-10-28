import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AmpliarCarta } from './AmpliarCarta'
import { Modal } from './Modal'
import type { Carta } from '../lib/types'

const carta: Carta = { id: 'G01', deck: 'grupal', numero: 1, coverImage: 'G01 Frente.png', contentImage: 'G01 Dorso.png' }

describe('AmpliarCarta', () => {
  it('voltea ambas caras dentro del visor sin cambiar la mesa ni el progreso', async () => {
    const user = userEvent.setup()
    localStorage.setItem('partida', 'sin cambios')
    render(<AmpliarCarta carta={carta} volteada={false} />)
    await user.click(screen.getByRole('button', { name: /Ampliar carta/ }))
    await user.click(screen.getByRole('button', { name: /Voltear carta/ }))
    expect(screen.getByRole('img', { name: 'Dorso de G01' })).toHaveAttribute('src', '/G01%20Dorso.png')
    await user.click(screen.getByRole('button', { name: /Voltear carta/ }))
    expect(screen.getByRole('img', { name: 'Frente de G01' })).toHaveAttribute('src', '/G01%20Frente.png')
    expect(localStorage.getItem('partida')).toBe('sin cambios')
    await user.click(screen.getByRole('button', { name: /Voltear carta/ }))
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    await user.click(screen.getByRole('button', { name: /Ampliar carta/ }))
    expect(screen.getByRole('img', { name: 'Frente de G01' })).toBeInTheDocument()
  })
  it('abre la cara actual y no modifica el almacenamiento', async () => {
    const user = userEvent.setup()
    localStorage.setItem('progreso-prueba', 'intacto')
    render(<AmpliarCarta carta={carta} volteada />)
    await user.click(screen.getByRole('button', { name: /Ampliar carta/ }))
    expect(screen.getByRole('img', { name: 'Dorso de G01' })).toHaveAttribute('src', '/G01%20Dorso.png')
    expect(localStorage.getItem('progreso-prueba')).toBe('intacto')
    expect(document.body.style.overflow).toBe('hidden')
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(document.body.style.overflow).toBe('')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Ampliar carta/ })).toHaveFocus()
  })
  it('amplía, aleja y ajusta sin cambiar la imagen', async () => {
    const user = userEvent.setup()
    render(<AmpliarCarta carta={carta} volteada={false} />)
    await user.click(screen.getByRole('button', { name: /Ampliar carta/ }))
    await user.click(screen.getByRole('button', { name: 'Acercar' }))
    expect(screen.getByText('125%')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Alejar' }))
    expect(screen.getByText('100%')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Acercar' }))
    await user.click(screen.getByRole('button', { name: 'Ajustar' }))
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByRole('img')).toHaveAttribute('src', '/G01%20Frente.png')
  })
  it('ajusta la carta al alto disponible y el zoom cambia sus dimensiones reales', async () => {
    const ancho = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(1000)
    const alto = vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(600)
    try {
      const user = userEvent.setup()
      render(<AmpliarCarta carta={carta} volteada={false} />)
      await user.click(screen.getByRole('button', { name: /Ampliar carta/ }))
      const imagen = screen.getByRole('img')
      expect(imagen).toHaveStyle({ height: '576px' })
      await user.click(screen.getByRole('button', { name: 'Acercar' }))
      expect(imagen).toHaveStyle({ height: '720px' })
      await user.click(screen.getByRole('button', { name: 'Ajustar' }))
      expect(imagen).toHaveStyle({ height: '576px' })
      await user.click(screen.getByRole('button', { name: 'Alejar' }))
      expect(imagen).toHaveStyle({ height: '432px' })
    } finally { ancho.mockRestore(); alto.mockRestore() }
  })
  it('Escape cierra solo el visor superior, no la ficha que está debajo', async () => {
    const cerrarFicha = vi.fn()
    const user = userEvent.setup()
    render(<Modal abierto titulo="Ficha" onCerrar={cerrarFicha}><AmpliarCarta carta={carta} volteada /></Modal>)
    await user.click(screen.getByRole('button', { name: /Ampliar carta/ }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog', { name: 'Ampliar carta G01' })).not.toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'Ficha' })).toBeInTheDocument()
    expect(cerrarFicha).not.toHaveBeenCalled()
  })
})
