import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

type Usuario = ReturnType<typeof userEvent.setup>

afterEach(() => {
  vi.restoreAllMocks()
})

/** Fija el azar para que la extracción sea determinista: siempre sale la primera disponible. */
function azarFijo() {
  vi.spyOn(Math, 'random').mockReturnValue(0)
}

function contador(): string {
  return document.querySelector('.sesion__contador')?.textContent ?? ''
}

async function elegirMazo(usuario: Usuario, posicion: number) {
  const seccion = document.querySelector('.mazos') as HTMLElement
  const botones = within(seccion).getAllByRole('button', { name: 'Jugar este mazo' })
  await usuario.click(botones[posicion])
}

/**
 * Toca «Parar» y espera a que la mezcla frene y salga la carta sorteada.
 * El frenado es una animación real, así que la extracción no es instantánea.
 */
async function parar(usuario: Usuario) {
  await usuario.click(screen.getByRole('button', { name: 'Parar' }))
  await screen.findByRole(
    'button',
    { name: /cara ilustrada a la vista/ },
    { timeout: 5000 },
  )
}

describe('portada', () => {
  it('muestra el hero, el selector unificado y los pasos', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Equipo en juego' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Comenzar a jugar' })).toBeInTheDocument()
    expect(screen.getByText(/30 cartas Grupales · 15 Individuales · 16 Teóricas/)).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Elegí tu mazo' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Así se juega' })).toBeInTheDocument()
    expect(screen.queryByText(/^61 cartas$/i)).not.toBeInTheDocument()
  })

  it('la biblioteca de Teóricas se abre sin extraer cartas', async () => {
    const usuario = userEvent.setup()
    render(<App />)

    const seccion = document.querySelector('.mazos') as HTMLElement
    await usuario.click(within(seccion).getByRole('button', { name: 'Abrir biblioteca' }))

    expect(screen.getByRole('heading', { name: 'Biblioteca de Teóricas' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Abrir ficha Teórica T01' })).toBeInTheDocument()
  })
})

describe('jugar un mazo', () => {
  it('sortea una carta al azar, la muestra boca abajo y la da vuelta', async () => {
    azarFijo()
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    expect(contador()).toContain('0 de 30 extraídas · quedan 30')

    await parar(usuario)

    // Primero se ve el dorso: la cara ilustrada, sin contenido.
    const carta = screen.getByRole('button', { name: /Carta G01, cara ilustrada a la vista/ })
    expect(carta).toHaveAttribute('aria-pressed', 'false')
    expect(contador()).toContain('1 de 30 extraídas · quedan 29')

    // Al tocar, gira y aparece el contenido.
    await usuario.click(carta)
    expect(screen.getByRole('button', { name: /Carta G01, contenido a la vista/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  it('no repite cartas al pedir otra', async () => {
    azarFijo()
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    await parar(usuario)
    expect(screen.getByRole('button', { name: /Carta G01/ })).toBeInTheDocument()

    await usuario.click(screen.getByRole('button', { name: 'Ver otra carta' }))

    expect(screen.getByRole('button', { name: /Carta G02/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Carta G01/ })).not.toBeInTheDocument()
    expect(contador()).toContain('2 de 30 extraídas · quedan 28')
  })

  it('volver al mazo deja la mesa lista para otro sorteo', async () => {
    azarFijo()
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    await parar(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Volver al mazo' }))

    expect(screen.getByRole('button', { name: 'Parar' })).toBeInTheDocument()
    expect(contador()).toContain('1 de 30 extraídas')
  })
})

describe('cambio de mazo', () => {
  it('cambiar de mazo no pierde el progreso del anterior', async () => {
    azarFijo()
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    await parar(usuario)
    expect(contador()).toContain('1 de 30 extraídas')

    // La navegación lateral es la que se vuelve tira compacta en pantallas chicas.
    expect(screen.getByRole('navigation', { name: 'Cambiar de mazo' })).toBeInTheDocument()
    await usuario.click(screen.getByRole('button', { name: /Cambiar al mazo Individual/ }))
    expect(contador()).toContain('0 de 15 extraídas')

    await usuario.click(screen.getByRole('button', { name: /Cambiar al mazo Grupal: 1 de 30 extraídas/ }))
    expect(contador()).toContain('1 de 30 extraídas')
  })
})

describe('reinicio', () => {
  it('pide confirmación antes de reiniciar y vuelve a dejar todo disponible', async () => {
    azarFijo()
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    await parar(usuario)
    expect(contador()).toContain('1 de 30 extraídas')

    await usuario.click(screen.getByRole('button', { name: 'Reiniciar mazo' }))
    const dialogo = screen.getByRole('dialog', { name: /Reiniciar el mazo Grupal/ })
    await usuario.click(within(dialogo).getByRole('button', { name: 'Sí, reiniciar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(contador()).toContain('0 de 30 extraídas · quedan 30')
    expect(screen.getByText('Mezclando cartas')).toBeInTheDocument()
    expect(screen.queryByText(/Quedan 30 de 30 sin extraer/)).not.toBeInTheDocument()
  })

  it('cancelar la confirmación no reinicia nada', async () => {
    azarFijo()
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    await parar(usuario)
    await usuario.click(screen.getByRole('button', { name: 'Reiniciar mazo' }))
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(contador()).toContain('1 de 30 extraídas')
  })
})

describe('herramientas relacionadas', () => {
  it('abre la ficha Teórica en un modal sin alterar la partida', async () => {
    azarFijo()
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    await parar(usuario)
    await usuario.click(screen.getByRole('button', { name: /Carta G01, cara ilustrada/ }))

    expect(screen.getByRole('heading', { name: 'Herramientas relacionadas' })).toBeInTheDocument()

    // G01 tiene dos vínculos (T02 y T03): hay que elegir uno de manera inequívoca.
    expect(screen.getAllByRole('button', { name: /Abrir ficha Teórica/ })).toHaveLength(2)
    await usuario.click(screen.getByRole('button', { name: 'T02 Abrir ficha Teórica' }))

    expect(screen.getByRole('dialog', { name: 'Ficha Teórica T02' })).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // La carta sigue en la mesa, volteada, y el progreso no se movió.
    expect(screen.getByRole('button', { name: /Carta G01, contenido a la vista/ })).toBeInTheDocument()
    expect(contador()).toContain('1 de 30 extraídas')
  })

  it('no muestra la sección si la carta no tiene Teóricas vinculadas', async () => {
    // G09 tiene lista vacía deliberada en la curaduría. Se apunta directo a G09
    // (índice 8 del mazo Grupal) con un azar constante, sin debilitar la prueba.
    vi.spyOn(Math, 'random').mockReturnValue(0.27)
    const usuario = userEvent.setup()
    render(<App />)

    await elegirMazo(usuario, 0)
    await parar(usuario)

    const carta = screen.getByRole('button', { name: /Carta G09, cara ilustrada/ })
    await usuario.click(carta)

    expect(screen.queryByRole('heading', { name: 'Herramientas relacionadas' })).not.toBeInTheDocument()
  })
})

describe('ficha Teórica', () => {
  it('se abre desde la biblioteca con el mismo giro 3D que los otros mazos', async () => {
    const usuario = userEvent.setup()
    render(<App />)

    const seccion = document.querySelector('.mazos') as HTMLElement
    await usuario.click(within(seccion).getByRole('button', { name: 'Abrir biblioteca' }))
    await usuario.click(screen.getByRole('button', { name: 'Abrir ficha Teórica T01' }))

    const dialogo = screen.getByRole('dialog', { name: 'Ficha Teórica T01' })
    const ficha = within(dialogo).getByRole('button', { name: /Carta T01, cara ilustrada a la vista/ })
    expect(ficha).toHaveAttribute('aria-pressed', 'false')

    await usuario.click(ficha)
    expect(
      within(dialogo).getByRole('button', { name: /Carta T01, contenido a la vista/ }),
    ).toHaveAttribute('aria-pressed', 'true')
  })
})
