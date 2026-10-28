import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Modal } from './Modal'

describe('Modal', () => {
  it('no renderiza nada cuando está cerrado', () => {
    render(
      <Modal abierto={false} titulo="Cerrar" onCerrar={() => {}}>
        <p>contenido</p>
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('se abre como diálogo accesible con su título', () => {
    render(
      <Modal abierto titulo="Ficha Teórica T01" subtitulo="Consulta privada" onCerrar={() => {}}>
        <p>contenido</p>
      </Modal>,
    )

    const dialogo = screen.getByRole('dialog', { name: 'Ficha Teórica T01' })
    expect(dialogo).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Consulta privada')).toBeInTheDocument()
  })

  it('se cierra con el botón de cerrar', () => {
    const onCerrar = vi.fn()
    render(
      <Modal abierto titulo="Ficha" onCerrar={onCerrar}>
        <p>contenido</p>
      </Modal>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('se cierra con la tecla Escape', () => {
    const onCerrar = vi.fn()
    render(
      <Modal abierto titulo="Ficha" onCerrar={onCerrar}>
        <p>contenido</p>
      </Modal>,
    )

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('se cierra al hacer clic en el fondo', () => {
    const onCerrar = vi.fn()
    const { container } = render(
      <Modal abierto titulo="Ficha" onCerrar={onCerrar}>
        <p>contenido</p>
      </Modal>,
    )

    const fondo = container.ownerDocument.querySelector('.modal') as HTMLElement
    fireEvent.mouseDown(fondo)
    expect(onCerrar).toHaveBeenCalledTimes(1)
  })

  it('no se cierra al hacer clic dentro del cuadro', () => {
    const onCerrar = vi.fn()
    render(
      <Modal abierto titulo="Ficha" onCerrar={onCerrar}>
        <p>contenido</p>
      </Modal>,
    )

    fireEvent.mouseDown(screen.getByText('contenido'))
    expect(onCerrar).not.toHaveBeenCalled()
  })
})
