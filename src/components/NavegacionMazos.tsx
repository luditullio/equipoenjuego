import { extraidas, totalDeMazo, type Progreso } from '../lib/progress'
import { presentacionDe } from '../lib/mazos'
import { ORDEN_MAZOS, type DeckId } from '../lib/types'

interface Props {
  mazoActual: DeckId
  progreso: Progreso
  onCambiar: (mazo: DeckId) => void
}

/**
 * Barra lateral con los otros dos mazos (en móvil se vuelve una tira compacta).
 * Cambiar de mazo no reinicia el progreso de ninguno.
 */
export function NavegacionMazos({ mazoActual, progreso, onCambiar }: Props) {
  const otros = ORDEN_MAZOS.filter((mazo) => mazo !== mazoActual)

  return (
    <nav className="navegacion-mazos" aria-label="Cambiar de mazo">
      <h2 className="navegacion-mazos__titulo">Otros mazos</h2>
      <ul className="navegacion-mazos__lista">
        {otros.map((mazo) => {
          const presentacion = presentacionDe(mazo)
          const total = totalDeMazo(progreso, mazo)
          const salieron = extraidas(progreso, mazo).length
          const detalle =
            mazo === 'teoricas' ? `${total} fichas de consulta` : `${salieron} de ${total} extraídas`
          return (
            <li key={mazo}>
              <button
                type="button"
                className="navegacion-mazos__boton"
                style={{ ['--color-mazo' as string]: presentacion.color }}
                onClick={() => onCambiar(mazo)}
                aria-label={`Cambiar al mazo ${presentacion.nombre}: ${detalle}`}
              >
                <img src={presentacion.placeholder} alt="" className="navegacion-mazos__dorso" />
                <span className="navegacion-mazos__texto">
                <img src={presentacion.icono} alt="" className="navegacion-mazos__icono" />
                <span className="navegacion-mazos__nombre">{presentacion.nombre}</span>
                <span className="navegacion-mazos__detalle">{detalle}</span>
                <span className="navegacion-mazos__accion">{mazo === 'teoricas' ? 'Abrir biblioteca' : 'Cambiar de mazo'} <span aria-hidden="true">→</span></span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      <p className="navegacion-mazos__nota">Tu progreso se conserva al cambiar de mazo.</p>
    </nav>
  )
}
