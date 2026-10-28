import { useState } from 'react'

interface Props {
  errores: readonly string[]
  advertencias: readonly string[]
  onVerDetalle: () => void
}

/** Aviso de arranque: reporta faltantes o ambigüedades del material en vez de romper la vista. */
export function AvisoValidacion({ errores, advertencias, onVerDetalle }: Props) {
  const [cerrado, setCerrado] = useState(false)
  if (cerrado) return null
  if (errores.length === 0 && advertencias.length === 0) return null

  const hayErrores = errores.length > 0

  return (
    <div className={`aviso-banda ${hayErrores ? 'aviso-banda--error' : 'aviso-banda--atencion'}`} role="status">
      <div className="aviso-banda__contenido">
        <strong>{hayErrores ? 'Hay problemas con el material de las cartas.' : 'Material provisorio.'}</strong>
        <ul className="aviso-banda__lista">
          {(hayErrores ? errores : advertencias).slice(0, 3).map((texto) => (
            <li key={texto}>{texto}</li>
          ))}
        </ul>
      </div>
      <div className="aviso-banda__acciones">
        {import.meta.env.DEV ? (
          <button type="button" className="boton boton--mini" onClick={onVerDetalle}>
            Ver en Administración
          </button>
        ) : null}
        <button type="button" className="boton boton--mini" onClick={() => setCerrado(true)}>
          Ocultar
        </button>
      </div>
    </div>
  )
}
