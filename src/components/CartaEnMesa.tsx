import type { Carta } from '../lib/types'
import { ImagenCarta } from './ImagenCarta'

interface Props {
  carta: Carta
  /** `false` = se ve la cara ilustrada (la tapa). `true` = se ve el contenido. */
  volteada: boolean
  onVoltear: () => void
}

/**
 * Carta con giro 3D. Es el mismo componente para los tres mazos: primero se ve
 * la cara ilustrada (`coverImage`); al tocar la carta gira 180° sobre el eje
 * vertical y aparece el contenido (`contentImage`). Se puede volver a girar.
 */
export function CartaVolteable({ carta, volteada, onVoltear }: Props) {
  const etiqueta = volteada
    ? `Carta ${carta.id}, contenido a la vista. Presioná para volver a la cara ilustrada.`
    : `Carta ${carta.id}, cara ilustrada a la vista. Presioná para dar vuelta y ver el contenido.`

  return (
    <button
      type="button"
      className={`carta ${volteada ? 'carta--volteada' : ''}`}
      onClick={onVoltear}
      aria-pressed={volteada}
      aria-label={etiqueta}
    >
      <span className="carta__marco">
        <span className="carta__cara carta__cara--tapa">
          <ImagenCarta
            ruta={carta.coverImage}
            alt={carta.altCover ?? ''}
            etiqueta={`Cara ilustrada de ${carta.id}`}
            prioridad
          />
        </span>
        <span className="carta__cara carta__cara--contenido">
          <ImagenCarta
            ruta={carta.contentImage}
            alt={carta.altContent ?? ''}
            etiqueta={`Contenido de ${carta.id}`}
            prioridad
          />
        </span>
      </span>
    </button>
  )
}

/** Carta práctica sobre la mesa, con su código y la insignia de curaduría. */
export function CartaEnMesa({ carta, volteada, onVoltear }: Props) {
  return (
    <div className="mesa__carta">
      <CartaVolteable carta={carta} volteada={volteada} onVoltear={onVoltear} />
      <p className="mesa__etiqueta">
        Carta <strong>{carta.id}</strong>
        {carta.asociacionPorConfirmar ? (
          <span className="insignia insignia--alerta" title={carta.nota}>
            caras por confirmar
          </span>
        ) : null}
      </p>
      <p className="mesa__giro"><span aria-hidden="true">⇄</span> {volteada ? 'Tocá la carta para volver al frente' : 'Tocá la carta para ver el dorso'}</p>
    </div>
  )
}
