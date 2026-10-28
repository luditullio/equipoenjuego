import type { Carta } from '../lib/types'
import { CartaVolteable } from './CartaEnMesa'
import { Modal } from './Modal'
import { AmpliarCarta } from './AmpliarCarta'

interface Props {
  carta: Carta | null
  /** `false` = se ve la cara ilustrada (la tapa). `true` = se ve el contenido. */
  volteada: boolean
  onVoltear: () => void
  onCerrar: () => void
}

/**
 * Ficha Teórica en modal: usa el mismo componente de giro 3D que las cartas
 * Grupales e Individuales. Es solo lectura: no altera la partida ni el orden de
 * extracción.
 */
export function ModalFichaTeorica({ carta, volteada, onVoltear, onCerrar }: Props) {
  return (
    <Modal
      abierto={Boolean(carta)}
      titulo={carta ? `Ficha Teórica ${carta.id}` : 'Ficha Teórica'}
      subtitulo="Mazo Teóricas · consulta privada del líder"
      onCerrar={onCerrar}
    >
      {carta ? (
        <div className="ficha">
          <div className="ficha__controles">
            <AmpliarCarta key={carta.id} carta={carta} volteada={volteada} />
          </div>
          <div className="ficha__carta">
            <CartaVolteable carta={carta} volteada={volteada} onVoltear={onVoltear} />
            <p className="ficha__giro">⇄ {volteada ? 'Tocá la carta para volver al frente' : 'Tocá la carta para ver el dorso'}</p>
          </div>
          <p className="ficha__nota">
            Consulta privada del líder. Esta ficha no se juega con reportes y no consume cartas del mazo.
          </p>
        </div>
      ) : null}
    </Modal>
  )
}
