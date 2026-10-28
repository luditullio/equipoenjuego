import { useState } from 'react'
import { useMovimientoReducido } from '../hooks/useMovimientoReducido'
import { presentacionDe } from '../lib/mazos'
import { BAJADA } from '../lib/editorial'
import { disponibles, extraidas, totalDeMazo, type Progreso } from '../lib/progress'
import type { Carta, DeckId, RelacionPracticaTeorica } from '../lib/types'
import { CartaEnMesa } from './CartaEnMesa'
import { EtapaMezcla } from './EtapaMezcla'
import { HerramientasRelacionadas } from './HerramientasRelacionadas'
import { Modal } from './Modal'
import { NavegacionMazos } from './NavegacionMazos'
import { AmpliarCarta } from './AmpliarCarta'

interface Props {
  mazo: DeckId
  progreso: Progreso
  relaciones: readonly RelacionPracticaTeorica[]
  onExtraer: (mazo: DeckId) => Carta | null
  onReiniciarMazo: (mazo: DeckId) => void
  onCambiarMazo: (mazo: DeckId) => void
  onAbrirFicha: (carta: Carta) => void
}

type Etapa = 'mezcla' | 'carta'

/** Sesión de juego de un mazo: mezcla, extracción al azar y giro de la carta. */
export function SesionMazo({
  mazo,
  progreso,
  relaciones,
  onExtraer,
  onReiniciarMazo,
  onCambiarMazo,
  onAbrirFicha,
}: Props) {
  const [etapa, setEtapa] = useState<Etapa>('mezcla')
  const [carta, setCarta] = useState<Carta | null>(null)
  const [volteada, setVolteada] = useState(false)
  const [confirmandoReinicio, setConfirmandoReinicio] = useState(false)
  const movimientoReducido = useMovimientoReducido()

  const presentacion = presentacionDe(mazo)
  const total = totalDeMazo(progreso, mazo)
  const quedan = disponibles(progreso, mazo).length
  const salieron = extraidas(progreso, mazo).length

  const extraerAhora = () => {
    const nueva = onExtraer(mazo)
    if (!nueva) {
      setEtapa('mezcla')
      setCarta(null)
      setVolteada(false)
      return
    }
    setCarta(nueva)
    setVolteada(false)
    setEtapa('carta')
  }

  const volverAlMazo = () => {
    setEtapa('mezcla')
    setCarta(null)
    setVolteada(false)
  }

  const confirmarReinicio = () => {
    onReiniciarMazo(mazo)
    setConfirmandoReinicio(false)
    volverAlMazo()
  }

  return (
    <div className="sesion" data-mazo={mazo} style={{ ['--color-mazo' as string]: presentacion.color }}>
      <div className="sesion__encabezado">
        <img className="sesion__icono" src={presentacion.icono} alt="" />
        <div><h1>Mazo {presentacion.nombre}</h1><p>{BAJADA[mazo]}</p></div>
      </div>

      <div className="sesion__cuerpo">
        <div className="sesion__escenario">
          <div className="sesion__cabecera-mesa">
            <span className="sesion__volanta">{presentacion.nombre}</span>
            <div>
              <progress value={salieron} max={total} aria-label={`Cartas extraídas del mazo ${presentacion.nombre}`} />
              <p className="sesion__contador">{salieron} de {total} extraídas · quedan {quedan}</p>
            </div>
          </div>
          {etapa === 'mezcla' ? (
            <EtapaMezcla
              mazo={mazo}
              disponibles={quedan}
              total={total}
              movimientoReducido={movimientoReducido}
              onParar={extraerAhora}
              onReiniciar={() => setConfirmandoReinicio(true)}
            />
          ) : null}

          {etapa === 'carta' && carta ? (
            <div className="mesa">
              <div className="mesa__controles">
              <AmpliarCarta carta={carta} volteada={volteada} />
              <div className="mesa__acciones">
                <button
                  type="button"
                  className="boton boton--principal"
                  onClick={extraerAhora}
                  disabled={quedan === 0}
                >
                  Ver otra carta
                </button>
                <button type="button" className="boton boton--secundario" onClick={volverAlMazo}>
                  Volver al mazo
                </button>
                <button
                  type="button"
                  className="boton boton--peligro"
                  onClick={() => setConfirmandoReinicio(true)}
                >
                  Reiniciar mazo
                </button>
              </div>

              {quedan === 0 ? (
                <p className="mesa__agotado" role="status">
                  Ya salieron las {total} cartas de este mazo. Reinicialo para volver a jugar.
                </p>
              ) : null}
              </div>
              <CartaEnMesa carta={carta} volteada={volteada} onVoltear={() => setVolteada((v) => !v)} />
              <div className="mesa__relaciones">
                {volteada ? <HerramientasRelacionadas carta={carta} relaciones={relaciones} onAbrirFicha={onAbrirFicha} /> : null}
              </div>
            </div>
          ) : null}
        </div>

        <NavegacionMazos mazoActual={mazo} progreso={progreso} onCambiar={onCambiarMazo} />
      </div>

      <p className="sesion__pie"><img src={presentacion.icono} alt="" />{presentacion.modalidad}</p>

      <Modal
        abierto={confirmandoReinicio}
        titulo={`¿Reiniciar el mazo ${presentacion.nombre}?`}
        variante="confirmacion"
        onCerrar={() => setConfirmandoReinicio(false)}
      >
        <p>
          Las {total} cartas vuelven a estar disponibles y se borra el registro de esta partida. El resto de los
          mazos no se toca.
        </p>
        <div className="modal__acciones">
          <button type="button" className="boton boton--peligro" onClick={confirmarReinicio}>
            Sí, reiniciar
          </button>
          <button type="button" className="boton boton--secundario" onClick={() => setConfirmandoReinicio(false)}>
            Cancelar
          </button>
        </div>
      </Modal>
    </div>
  )
}
