import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Carta } from '../lib/types'
import { urlDeCarta } from '../lib/assets'
import { useTrampaDeFoco } from '../hooks/useTrampaDeFoco'

/** Visor con volteo local: nunca modifica la carta de la mesa ni el progreso. */
export function AmpliarCarta({ carta, volteada }: { carta: Carta; volteada: boolean }) {
  const [abierto, setAbierto] = useState(false)
  const [escala, setEscala] = useState(1)
  const [caraAmpliada, setCaraAmpliada] = useState(volteada)
  const [ajustada, setAjustada] = useState({ width: 280, height: 400 })
  const caja = useRef<HTMLDivElement>(null)
  const ventana = useRef<HTMLDivElement>(null)
  const cerrar = useCallback(() => setAbierto(false), [])
  useTrampaDeFoco(caja, abierto, cerrar)
  useEffect(() => {
    if (!abierto || !ventana.current) return
    const nodo = ventana.current
    const medir = () => {
      const alto = Math.max(1, Math.min(nodo.clientHeight - 24, (nodo.clientWidth - 24) / .7))
      setAjustada({ width: alto * .7, height: alto })
    }
    medir()
    const observador = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(medir)
    observador?.observe(nodo)
    window.addEventListener('resize', medir)
    return () => { observador?.disconnect(); window.removeEventListener('resize', medir) }
  }, [abierto])
  useEffect(() => {
    if (!abierto) return
    const anterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = anterior }
  }, [abierto])
  const ajustar = () => {
    setEscala(1)
    if (ventana.current) { ventana.current.scrollTop = 0; ventana.current.scrollLeft = 0 }
  }
  return <>
    <button type="button" className="ampliar-carta" onClick={() => { setCaraAmpliada(volteada); setEscala(1); setAbierto(true) }}>
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="m15 15 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg> Ampliar carta
    </button>
    {abierto ? createPortal(
      <div className="zoom-carta" onMouseDown={e => { if (e.target === e.currentTarget) cerrar() }}>
        <div className="zoom-carta__caja" role="dialog" aria-modal="true" aria-label={`Ampliar carta ${carta.id}`} ref={caja} tabIndex={-1}>
          <header className="zoom-carta__barra">
            <span aria-live="polite">{carta.id} · {caraAmpliada ? 'Dorso' : 'Frente'}</span>
            <div className="zoom-carta__acciones">
              <button type="button" aria-label="Alejar" disabled={escala <= .5} onClick={() => setEscala(v => Math.max(.5, v - .25))}>−</button>
              <output aria-live="polite">{Math.round(escala * 100)}%</output>
              <button type="button" aria-label="Acercar" disabled={escala >= 4} onClick={() => setEscala(v => Math.min(4, v + .25))}>+</button>
              <button type="button" onClick={ajustar}>Ajustar</button>
              <button type="button" onClick={() => { setCaraAmpliada(v => !v); ajustar() }}>⇄ Voltear carta</button>
              <button type="button" onClick={cerrar}>Cerrar</button>
            </div>
          </header>
          <div className="zoom-carta__ventana" ref={ventana} tabIndex={0} aria-label="Imagen ampliada. Usá las barras de desplazamiento o las flechas para recorrerla.">
            <div className="zoom-carta__superficie">
              <img style={{ width: ajustada.width * escala, height: ajustada.height * escala }} src={urlDeCarta(caraAmpliada ? carta.contentImage : carta.coverImage)} alt={`${caraAmpliada ? 'Dorso' : 'Frente'} de ${carta.id}`} draggable={false} />
            </div>
          </div>
        </div>
      </div>, document.body) : null}
  </>
}
