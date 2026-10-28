import { relacionDe, teoricasRelacionadas } from '../lib/links'
import type { Carta, RelacionPracticaTeorica } from '../lib/types'

interface Props {
  carta: Carta
  relaciones: readonly RelacionPracticaTeorica[]
  onAbrirFicha: (cartaTeorica: Carta) => void
}

/**
 * Sección «Herramientas relacionadas»: solo aparece si la carta práctica tiene
 * al menos una Teórica vinculada. Abre la ficha en un modal, sin tocar la partida.
 */
export function HerramientasRelacionadas({ carta, relaciones, onAbrirFicha }: Props) {
  const vinculadas = teoricasRelacionadas(relaciones, carta.id)
  if (vinculadas.length === 0) return null

  const relacion = relacionDe(relaciones, carta.id)

  return (
    <section className="herramientas" aria-labelledby="titulo-herramientas">
      <h3 className="herramientas__titulo" id="titulo-herramientas">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6V3h8v3M3 7h18v14H3zM3 12h18M10 12v3h4v-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg> Herramientas relacionadas
      </h3>
      <p className="herramientas__bajada">
        Cartas Teóricas vinculadas a {carta.id}. Consulta privada del líder: abrir la ficha no modifica la partida
        ni el orden de extracción.
      </p>
      <ul className="herramientas__lista">
        {vinculadas.map((teorica) => (
          <li key={teorica.id}>
            <button type="button" className="boton-teorica" onClick={() => onAbrirFicha(teorica)}>
              <span className="boton-teorica__id">{teorica.id}</span>
              <span className="boton-teorica__texto">Abrir ficha Teórica</span>
            </button>
          </li>
        ))}
      </ul>
      {relacion?.provisorio ? (
        <p className="herramientas__aviso">
          Vínculo provisorio, pendiente de curaduría. Se edita en <code>src/data/links.json</code>.
        </p>
      ) : null}
    </section>
  )
}
