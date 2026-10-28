import { useRef } from 'react'
import { SVG, urlDeCarta } from '../lib/assets'
import { ARTE } from '../lib/editorial'
import { cartasDe } from '../lib/manifest'
import type { Progreso } from '../lib/progress'
import type { DeckId } from '../lib/types'
import { SelectorDeMazo } from './SelectorDeMazo'

interface Props { progreso: Progreso; onElegir: (mazo: DeckId) => void }

export function Inicio({ progreso, onElegir }: Props) {
  const seccionMazos = useRef<HTMLElement>(null)
  const ejemplo = cartasDe('grupal').find(c => c.id === 'G13')
  const comenzar = () => {
    const reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    seccionMazos.current?.scrollIntoView({ behavior: reducir ? 'auto' : 'smooth', block: 'start' })
    seccionMazos.current?.focus({ preventScroll: true })
  }
  return (
    <div className="inicio">
      <section className="hero">
        <img className="hero__arte" src={ARTE.hero} alt="" aria-hidden="true" loading="eager" />
        <div className="hero__texto">
          <p className="hero__volanta">Conversaciones · Reflexión · Equipo</p>
          <h1 className="hero__titulo">Equipo en juego</h1>
          <p className="hero__bajada">Cartas para quienes se animan a conducir diferente.</p>
          <button type="button" className="boton boton--principal boton--grande" onClick={comenzar}>Comenzar a jugar <span aria-hidden="true">→</span></button>
          <p className="hero__dato">30 cartas Grupales · 15 Individuales · 16 Teóricas</p>
        </div>
      </section>
      <section className="bloque bloque--mazos" ref={seccionMazos} tabIndex={-1} aria-labelledby="titulo-mazos">
        <h2 className="bloque__titulo editorial-regla" id="titulo-mazos">Elegí tu mazo</h2>
        <SelectorDeMazo progreso={progreso} onElegir={onElegir} />
      </section>
      <section className="bloque tutorial" aria-labelledby="titulo-como">
        <h2 className="bloque__titulo editorial-regla" id="titulo-como">Así se juega</h2>
        <ol className="tutorial__pasos">
          <li>
            <h3><span className="tutorial__numero">1</span>Elegí un mazo</h3>
            <div className="tutorial__elegir" aria-hidden="true">{(['grupal', 'individual', 'teoricas'] as const).map(m => <span className="tutorial__mazo" key={m}><img className="tutorial__dorso" src={SVG.mazo[m]} alt="" /></span>)}</div>
            <p>Elegí el mazo según el momento.</p>
          </li>
          <li>
            <h3><span className="tutorial__numero">2</span>Mezclá y presioná Parar</h3>
            <div className="tutorial__mezclar" aria-hidden="true">{[0,1,2].map(i => <img key={i} src={SVG.mazo.grupal} alt="" />)}</div>
            <p>Mezclás las cartas y presionás «Parar»: se sortea una carta al azar.</p>
          </li>
          <li>
            <h3><span className="tutorial__numero">3</span>Da vuelta la carta</h3>
            <div className="tutorial__revelar tutorial__revelar--dos-caras" aria-hidden="true">{ejemplo ? <><img src={urlDeCarta(ejemplo.coverImage)} alt="" /><span className="tutorial__flecha">⇄</span><img src={urlDeCarta(ejemplo.contentImage)} alt="" /></> : null}</div>
            <p>Tocás la carta para darla vuelta y leer su contenido.</p>
          </li>
        </ol>
        <p className="tutorial__nota"><img src={SVG.icono.teoricas} alt="" />Las Teóricas se consultan desde la biblioteca; no se sortean.</p>
        <p className="nota-provisoria">Ninguna carta se repite hasta que reinicies el mazo. Podés cambiar de mazo sin perder el progreso.</p>
      </section>
      <footer className="inicio__pie"><strong>Equipo en juego</strong><span>Para poner al equipo en juego</span></footer>
    </div>
  )
}
