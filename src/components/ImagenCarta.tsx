import { useEffect, useState } from 'react'
import { urlDeCarta } from '../lib/assets'

interface Props {
  /** Ruta relativa a la carpeta servida (`cartas/`), tal como figura en el manifiesto. */
  ruta: string
  alt?: string
  className?: string
  /** Nombre legible que se muestra si la imagen no carga. */
  etiqueta: string
  prioridad?: boolean
}

type Estado = 'cargando' | 'lista' | 'error'

/**
 * Imagen de una cara de carta. Si el archivo no existe (o el nombre cambió),
 * muestra un aviso con la ruta esperada en vez de una imagen rota.
 */
export function ImagenCarta({ ruta, alt = '', className, etiqueta, prioridad = false }: Props) {
  const [estado, setEstado] = useState<Estado>('cargando')

  useEffect(() => {
    setEstado('cargando')
  }, [ruta])

  if (estado === 'error') {
    return (
      <div className={`imagen-faltante ${className ?? ''}`}>
        <span className="imagen-faltante__titulo">Imagen no disponible</span>
        <span className="imagen-faltante__detalle">{etiqueta}</span>
        <code className="imagen-faltante__ruta">{ruta}</code>
        <span className="imagen-faltante__ayuda">
          Verificá que el archivo exista en la carpeta <code>cartas/</code> con ese nombre exacto.
        </span>
      </div>
    )
  }

  return (
    <img
      className={className}
      data-estado={estado}
      src={urlDeCarta(ruta)}
      alt={alt}
      loading={prioridad ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      onLoad={() => setEstado('lista')}
      onError={() => setEstado('error')}
    />
  )
}
