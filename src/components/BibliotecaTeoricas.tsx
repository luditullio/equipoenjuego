import { cartasDe } from '../lib/manifest'
import { SVG } from '../lib/assets'
import { TITULOS_TEORICAS } from '../lib/editorial'
import type { Carta, DeckId } from '../lib/types'
import { ImagenCarta } from './ImagenCarta'
import { NavegacionMazos } from './NavegacionMazos'
import type { Progreso } from '../lib/progress'

interface Props {
  progreso: Progreso
  onAbrirFicha: (carta: Carta) => void
  onCambiarMazo: (mazo: DeckId) => void
}

/** Biblioteca de cartas Teóricas: consulta directa, sin extracción aleatoria. */
export function BibliotecaTeoricas({ progreso, onAbrirFicha, onCambiarMazo }: Props) {
  const fichas = cartasDe('teoricas')

  return (
    <div className="biblioteca">
      <header className="biblioteca__encabezado">
        <img className="biblioteca__icono" src={SVG.icono.teoricas} alt="" />
        <p className="biblioteca__volanta">Consulta · {fichas.length} fichas</p>
        <h1 className="biblioteca__titulo">Biblioteca de Teóricas</h1>
        <p className="biblioteca__bajada">
          {fichas.length} fichas de consulta privada del líder. Se abren cuando las necesites: no se extraen al
          azar y no afectan el progreso de los otros mazos.
        </p>
      </header>
      <p className="biblioteca__pista">Tocá una carta para abrirla.</p>

      <ul className="biblioteca__grilla">
        {fichas.map((ficha) => (
          <li key={ficha.id}>
            <button
              type="button"
              className="ficha-miniatura"
              onClick={() => onAbrirFicha(ficha)}
              aria-label={`Abrir ficha Teórica ${ficha.id}`}
            >
              <span className="ficha-miniatura__imagen">
                <ImagenCarta ruta={ficha.coverImage} etiqueta={`Ilustración de la ficha ${ficha.id}`} />
              </span>
              <span className="ficha-miniatura__id">{ficha.id}</span>
              <span className="ficha-miniatura__titulo">{TITULOS_TEORICAS[ficha.id]}</span>
            </button>
          </li>
        ))}
      </ul>

      <NavegacionMazos mazoActual="teoricas" progreso={progreso} onCambiar={onCambiarMazo} />
    </div>
  )
}
