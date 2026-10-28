export type Vista = 'inicio' | 'jugar' | 'biblioteca' | 'admin'

interface Props {
  vista: Vista
  onNavegar: (vista: Vista) => void
}

// La entrada de Administración se agrega solo en el servidor de desarrollo local;
// en la build de producción `import.meta.env.DEV` es `false` y la opción se elimina
// del menú (no se oculta con CSS: no forma parte del bundle publicado).
const SECCIONES: { vista: Vista; etiqueta: string }[] = [
  { vista: 'inicio', etiqueta: 'Inicio' },
  { vista: 'jugar', etiqueta: 'Jugar' },
  { vista: 'biblioteca', etiqueta: 'Teóricas' },
  ...(import.meta.env.DEV ? [{ vista: 'admin' as Vista, etiqueta: 'Administración' }] : []),
]

export function Encabezado({ vista, onNavegar }: Props) {
  return (
    <header className="encabezado">
      <div className="encabezado__interior">
        <button type="button" className="marca" onClick={() => onNavegar('inicio')}>
          <span className="marca__texto">
            Equipo en juego
          </span>
        </button>

        <nav className="encabezado__nav" aria-label="Secciones">
          {SECCIONES.map((seccion) => (
            <button
              key={seccion.vista}
              type="button"
              className="encabezado__enlace"
              aria-current={vista === seccion.vista ? 'page' : undefined}
              onClick={() => onNavegar(seccion.vista)}
            >
              {seccion.etiqueta}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
