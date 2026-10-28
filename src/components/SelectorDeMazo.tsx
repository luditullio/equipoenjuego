import { todasLasPresentaciones } from '../lib/mazos'
import { ARTE, BAJADA } from '../lib/editorial'
import { extraidas, totalDeMazo, type Progreso } from '../lib/progress'
import type { DeckId } from '../lib/types'

interface Props {
  progreso: Progreso
  onElegir: (mazo: DeckId) => void
}

/** Sección de los tres mazos en la página de inicio. */
export function SelectorDeMazo({ progreso, onElegir }: Props) {
  return (
    <div className="mazos">
      {todasLasPresentaciones().map((presentacion) => {
        const total = presentacion.cartas || totalDeMazo(progreso, presentacion.id)
        const salieron = extraidas(progreso, presentacion.id).length
        const esTeorico = presentacion.id === 'teoricas'
        const porcentaje = total === 0 ? 0 : Math.round((salieron / total) * 100)

        return (
          <article
            key={presentacion.id}
            className="mazo"
            style={{ ['--color-mazo' as string]: presentacion.color, ['--color-suave' as string]: presentacion.colorSuave }}
          >
            <img className="mazo__arte" src={ARTE.categoria[presentacion.id]} alt="" loading="lazy" />
            <div className="mazo__contenido">
            <header className="mazo__encabezado">
              <img className="mazo__icono" src={presentacion.icono} alt="" />
              <div>
                <h3 className="mazo__nombre">{presentacion.nombre}</h3>
                <p className="mazo__cantidad">{presentacion.cartas} cartas</p>
              </div>
            </header>

            <p className="mazo__descripcion">{BAJADA[presentacion.id]}</p>

            {esTeorico ? (
              <p className="mazo__progreso">Biblioteca de consulta directa, separada de la extracción aleatoria.</p>
            ) : (
              <div className="mazo__progreso">
                <div
                  className="barra"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={total}
                  aria-valuenow={salieron}
                  aria-label={`Cartas extraídas del mazo ${presentacion.nombre}`}
                >
                  <span className="barra__relleno" style={{ width: `${porcentaje}%` }} />
                </div>
                <span className="mazo__progreso-texto">
                  {salieron} de {total} extraídas
                </span>
              </div>
            )}

            <button type="button" className="boton boton--mazo" onClick={() => onElegir(presentacion.id)}>
              {esTeorico ? 'Abrir biblioteca' : 'Jugar este mazo'}
            </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
