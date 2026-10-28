import { useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useTrampaDeFoco } from '../hooks/useTrampaDeFoco'

interface Props {
  abierto: boolean
  titulo: string
  onCerrar: () => void
  children: ReactNode
  variante?: 'ficha' | 'confirmacion'
  subtitulo?: string
}

function IconoCerrar() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/** Diálogo accesible: foco encerrado, cierre con Escape y con clic en el fondo. */
export function Modal({ abierto, titulo, subtitulo, onCerrar, children, variante = 'ficha' }: Props) {
  const caja = useRef<HTMLDivElement>(null)
  useTrampaDeFoco(caja, abierto, onCerrar)

  if (!abierto) return null

  return createPortal(
    <div
      className="modal"
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar()
      }}
    >
      <div
        className={`modal__caja modal__caja--${variante}`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        ref={caja}
        tabIndex={-1}
      >
        <header className="modal__encabezado">
          <div>
            <h2 className="modal__titulo">{titulo}</h2>
            {subtitulo ? <p className="modal__subtitulo">{subtitulo}</p> : null}
          </div>
          <button type="button" className="boton-icono" onClick={onCerrar} aria-label="Cerrar">
            <IconoCerrar />
          </button>
        </header>
        <div className="modal__cuerpo">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
