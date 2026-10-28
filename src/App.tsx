import { lazy, Suspense, useMemo, useState } from 'react'
import { AvisoValidacion } from './components/AvisoValidacion'
import { BibliotecaTeoricas } from './components/BibliotecaTeoricas'
import { Encabezado, type Vista } from './components/Encabezado'
import { Inicio } from './components/Inicio'
import { ModalFichaTeorica } from './components/ModalFichaTeorica'
import { SesionMazo } from './components/SesionMazo'
import { useProgreso } from './hooks/useProgreso'
import { borrarRelacionesDeAdmin, leerRelacionesDeAdmin } from './lib/ajustesAdmin'
import { relacionesPorDefecto } from './lib/links'
import { validarManifiesto } from './lib/manifest'
import type { Carta, DeckId, RelacionPracticaTeorica } from './lib/types'

// Administración: solo en el servidor de desarrollo local. En la build de
// producción el panel no se importa —queda fuera del bundle— y la vista nunca
// se alcanza (ni por menú, ni por URL, ni por estado de navegación).
const PanelAdmin = import.meta.env.DEV
  ? lazy(() => import('./components/PanelAdmin').then((modulo) => ({ default: modulo.PanelAdmin })))
  : null

export default function App() {
  const { progreso, extraer, reiniciarMazo, reiniciarTodo } = useProgreso()
  const [vista, setVista] = useState<Vista>('inicio')
  const [mazoActual, setMazoActual] = useState<DeckId>('grupal')
  const [ficha, setFicha] = useState<Carta | null>(null)
  const [fichaVolteada, setFichaVolteada] = useState(false)
  // Los ajustes locales de vínculos son una herramienta de administración: solo
  // se leen en desarrollo. En producción rige siempre la curaduría del archivo.
  const [relaciones, setRelaciones] = useState<RelacionPracticaTeorica[]>(() => {
    const guardadas = import.meta.env.DEV ? leerRelacionesDeAdmin() : null
    return guardadas ?? relacionesPorDefecto()
  })
  const [hayAjustesLocales, setHayAjustesLocales] = useState(
    () => import.meta.env.DEV && leerRelacionesDeAdmin() !== null,
  )

  const validacion = useMemo(() => validarManifiesto(), [])

  /** Navegación de la app. Bloquea Administración cuando no está habilitada. */
  const navegar = (destino: Vista) => {
    if (destino === 'admin' && !import.meta.env.DEV) return
    setVista(destino)
  }

  const elegirMazo = (mazo: DeckId) => {
    if (mazo === 'teoricas') {
      setVista('biblioteca')
      return
    }
    setMazoActual(mazo)
    setVista('jugar')
  }

  const aplicarRelaciones = (nuevas: RelacionPracticaTeorica[]) => {
    setRelaciones(nuevas)
    setHayAjustesLocales(true)
  }

  // La ficha se abre en un modal por encima de la partida: la carta práctica y
  // el progreso quedan intactos. Al abrir siempre arranca por la cara ilustrada.
  const abrirFicha = (carta: Carta) => {
    setFichaVolteada(false)
    setFicha(carta)
  }

  const cerrarFicha = () => {
    setFicha(null)
    setFichaVolteada(false)
  }

  const restaurarRelaciones = () => {
    borrarRelacionesDeAdmin()
    setRelaciones(relacionesPorDefecto())
    setHayAjustesLocales(false)
  }

  return (
    <div className="app">
      <Encabezado vista={vista} onNavegar={navegar} />

      <div className="contenedor">
        <AvisoValidacion
          errores={validacion.errores}
          advertencias={validacion.advertencias}
          onVerDetalle={() => navegar('admin')}
        />
      </div>

      <main className={vista === 'jugar' ? 'lienzo lienzo--oscuro' : 'lienzo'}>
        <div className="contenedor">
          {vista === 'inicio' ? <Inicio progreso={progreso} onElegir={elegirMazo} /> : null}

          {vista === 'jugar' ? (
            <SesionMazo
              key={mazoActual}
              mazo={mazoActual}
              progreso={progreso}
              relaciones={relaciones}
              onExtraer={extraer}
              onReiniciarMazo={reiniciarMazo}
              onCambiarMazo={elegirMazo}
              onAbrirFicha={abrirFicha}
            />
          ) : null}

          {vista === 'biblioteca' ? (
            <BibliotecaTeoricas
              progreso={progreso}
              onAbrirFicha={abrirFicha}
              onCambiarMazo={elegirMazo}
            />
          ) : null}

          {vista === 'admin' && PanelAdmin ? (
            <Suspense fallback={null}>
              <PanelAdmin
                progreso={progreso}
                relaciones={relaciones}
                hayAjustesLocales={hayAjustesLocales}
                onAplicarRelaciones={aplicarRelaciones}
                onRestaurarRelaciones={restaurarRelaciones}
                onReiniciarMazo={reiniciarMazo}
                onReiniciarTodo={reiniciarTodo}
              />
            </Suspense>
          ) : null}
        </div>
      </main>

      <ModalFichaTeorica
        carta={ficha}
        volteada={fichaVolteada}
        onVoltear={() => setFichaVolteada((v) => !v)}
        onCerrar={cerrarFicha}
      />
    </div>
  )
}
