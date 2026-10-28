import { useEffect, useRef, useState } from 'react'
import { presentacionDe } from '../lib/mazos'
import type { DeckId } from '../lib/types'

interface Props {
  mazo: DeckId
  disponibles: number
  total: number
  movimientoReducido: boolean
  onParar: () => void
  onReiniciar: () => void
}

/** Cuántas cartas entran en el barajado. */
const CARTAS = 7
/** Milisegundos del frenado suave anterior a la extracción. */
const FRENADO_MS = 620

interface Camino {
  /** Recorrido lateral, en % del ancho de la carta. */
  lateral: number
  /** Vaivén vertical, en px. */
  vertical: number
  /** Giro en el plano, en grados. */
  giro: number
  /** Inclinación en profundidad, en grados. */
  profundidad: number
  /** Variación de tamaño: acerca y aleja la carta. */
  tamaño: number
  /** Velocidad angular, en radianes por segundo. */
  velocidad: number
  /** Desfase inicial, para que ninguna carta repita el movimiento de otra. */
  fase: number
  sentido: 1 | -1
}

interface Pose {
  x: number
  y: number
  giro: number
  profundidad: number
  escala: number
}

/**
 * Un camino distinto por carta: cambia la velocidad, el sentido, el recorrido y
 * la fase. Así se cruzan, se adelantan y vuelven a integrarse al mazo en vez de
 * moverse todas juntas como un solo bloque.
 */
const CAMINOS: readonly Camino[] = [
  { lateral: 26, vertical: 15, giro: 13, profundidad: 20, tamaño: 0.05, velocidad: 1.9, fase: 0, sentido: 1 },
  { lateral: 33, vertical: 22, giro: -17, profundidad: 28, tamaño: 0.07, velocidad: 1.45, fase: 2.1, sentido: -1 },
  { lateral: 21, vertical: 12, giro: 21, profundidad: 15, tamaño: 0.04, velocidad: 2.45, fase: 4, sentido: 1 },
  { lateral: 34, vertical: 26, giro: -11, profundidad: 32, tamaño: 0.08, velocidad: 1.2, fase: 1.2, sentido: -1 },
  { lateral: 24, vertical: 18, giro: 19, profundidad: 24, tamaño: 0.06, velocidad: 2.1, fase: 5.3, sentido: 1 },
  { lateral: 30, vertical: 14, giro: -23, profundidad: 18, tamaño: 0.05, velocidad: 1.65, fase: 3.4, sentido: -1 },
  { lateral: 19, vertical: 20, giro: 15, profundidad: 26, tamaño: 0.07, velocidad: 2.7, fase: 0.8, sentido: 1 },
]

/** Pila prolija: un abanico apenas abierto alrededor del centro. */
function poseDeReposo(indice: number): Pose {
  const centro = (CARTAS - 1) / 2
  return {
    x: 0,
    y: -Math.abs(indice - centro) * 1.2,
    giro: (indice - centro) * 1.8,
    profundidad: 0,
    escala: 1,
  }
}

/** Posición de una carta en el instante `tiempo` (segundos). */
function poseBarajando(indice: number, tiempo: number): Pose {
  const camino = CAMINOS[indice]
  const base = poseDeReposo(indice)
  const onda = camino.velocidad * tiempo + camino.fase
  return {
    x: camino.sentido * camino.lateral * (Math.sin(onda) + 0.25 * Math.sin(onda * 0.57)),
    y: base.y - camino.vertical * (0.5 + 0.5 * Math.sin(onda * 1.7 + camino.fase)),
    giro: base.giro + camino.giro * Math.sin(onda * 1.15),
    profundidad: camino.profundidad * Math.cos(onda),
    escala: 1 + camino.tamaño * Math.sin(onda * 0.9),
  }
}

function interpolar(desde: Pose, hasta: Pose, avance: number): Pose {
  return {
    x: desde.x + (hasta.x - desde.x) * avance,
    y: desde.y + (hasta.y - desde.y) * avance,
    giro: desde.giro + (hasta.giro - desde.giro) * avance,
    profundidad: desde.profundidad + (hasta.profundidad - desde.profundidad) * avance,
    escala: desde.escala + (hasta.escala - desde.escala) * avance,
  }
}

function aplicarPose(nodo: HTMLElement, pose: Pose) {
  // Amplitud óptica moderada: cambia solo la presentación, no el sorteo ni el frenado.
  nodo.style.transform = `translate3d(${(pose.x * 0.45).toFixed(2)}%, ${(pose.y * 0.6).toFixed(2)}px, 0) rotateY(${(pose.profundidad * 0.3).toFixed(2)}deg) rotate(${(pose.giro * 0.45).toFixed(2)}deg) scale(${(1 + (pose.escala - 1) * 0.4).toFixed(3)})`
  // La carta más corrida a la derecha queda arriba: el orden cambia mientras se cruzan.
  nodo.style.zIndex = String(Math.round(100 + pose.x))
}

// jsdom no siempre expone requestAnimationFrame: hay un reemplazo con temporizador.
const pedirCuadro: (callback: (tiempo: number) => void) => number =
  typeof requestAnimationFrame === 'function'
    ? requestAnimationFrame
    : (callback) => window.setTimeout(() => callback(performance.now()), 16)
const cancelarCuadro: (id: number) => void =
  typeof cancelAnimationFrame === 'function' ? cancelAnimationFrame : (id) => window.clearTimeout(id)

/**
 * Animación de mezcla: cartas boca abajo que se cruzan hasta que se presiona
 * «Parar». Al parar, el barajado se frena y se asienta, y recién entonces se
 * sortea la carta de verdad entre las no extraídas.
 */
export function EtapaMezcla({
  mazo,
  disponibles,
  total,
  movimientoReducido,
  onParar,
  onReiniciar,
}: Props) {
  const presentacion = presentacionDe(mazo)
  const agotado = disponibles === 0
  const [frenando, setFrenando] = useState(false)
  const nodos = useRef<(HTMLImageElement | null)[]>([])
  const onPararRef = useRef(onParar)
  const detener = useRef<() => void>(() => onParar())

  useEffect(() => {
    onPararRef.current = onParar
  })

  useEffect(() => {
    const lista = nodos.current
    const acomodar = () => lista.forEach((nodo, indice) => nodo && aplicarPose(nodo, poseDeReposo(indice)))

    // Sin animación: la pila queda quieta y «Parar» extrae enseguida.
    if (movimientoReducido || agotado) {
      acomodar()
      detener.current = () => onPararRef.current()
      return
    }

    let cuadro = 0
    // Todo el cálculo de tiempo usa el reloj de los cuadros (el mismo `ahora`
    // que entrega requestAnimationFrame). Mezclar relojes desacomoda las poses.
    let arranque: number | null = null
    let frenado: { desde: number; poses: Pose[] } | null = null
    let pedidoDeParar = false

    const pintar = (ahora: number) => {
      if (arranque === null) arranque = ahora
      const tiempo = (ahora - arranque) / 1000

      // El frenado arranca en el primer cuadro posterior al toque de «Parar»,
      // tomando las poses que están en pantalla: así no hay salto.
      if (pedidoDeParar && !frenado) {
        frenado = { desde: ahora, poses: CAMINOS.map((_, indice) => poseBarajando(indice, tiempo)) }
      }

      let terminado = false

      for (let indice = 0; indice < lista.length; indice += 1) {
        const nodo = lista[indice]
        if (!nodo) continue
        if (frenado) {
          const avance = Math.max(0, Math.min(1, (ahora - frenado.desde) / FRENADO_MS))
          // Ease-out cúbico: sale rápido y se asienta cada vez más despacio.
          const alivio = 1 - (1 - avance) ** 3
          aplicarPose(nodo, interpolar(frenado.poses[indice], poseDeReposo(indice), alivio))
          if (avance >= 1) terminado = true
        } else {
          aplicarPose(nodo, poseBarajando(indice, tiempo))
        }
      }

      if (terminado) {
        onPararRef.current()
        return
      }
      cuadro = pedirCuadro(pintar)
    }

    cuadro = pedirCuadro(pintar)

    detener.current = () => {
      pedidoDeParar = true
    }

    return () => {
      cancelarCuadro(cuadro)
      detener.current = () => onPararRef.current()
    }
  }, [movimientoReducido, agotado])

  const parar = () => {
    setFrenando(true)
    detener.current()
  }

  return (
    <section className="mezcla" aria-labelledby="titulo-mezcla">
      <div className="mezcla__pila" data-agotado={agotado} aria-hidden="true">
        {CAMINOS.map((_, indice) => (
          <img
            key={indice}
            ref={(nodo) => {
              nodos.current[indice] = nodo
            }}
            className="mezcla__dorso"
            src={presentacion.placeholder}
            alt=""
            draggable={false}
          />
        ))}
      </div>

      <div className="mezcla__controles">
      <h2 className="mezcla__titulo" id="titulo-mezcla">
        Mazo {presentacion.nombre}
      </h2>

      <p className="mezcla__estado" role="status">
        {agotado
          ? `Ya salieron las ${total} cartas del mazo. Reinicialo para volver a jugar.`
          : frenando
            ? 'El mazo se acomoda y sale una carta…'
            : 'Mezclando cartas'}
      </p>

      {agotado ? (
        <button type="button" className="boton boton--principal" onClick={onReiniciar}>
          Reiniciar mazo
        </button>
      ) : (
        <>
          <button type="button" className="boton boton--parar" onClick={parar} disabled={frenando}>
            Parar
          </button>
        </>
      )}

      <p className="mezcla__pie">
        <img src={presentacion.icono} alt="" className="mezcla__icono" />
        {presentacion.modalidad}
      </p>
      </div>
    </section>
  )
}
