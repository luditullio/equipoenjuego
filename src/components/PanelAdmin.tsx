import { useEffect, useMemo, useRef, useState } from 'react'
// Los estilos del panel viajan con este componente: al no importarse en producción,
// tampoco se publica su CSS.
import '../estilos/admin.css'
import { urlDeCarta } from '../lib/assets'
import { CARTAS, cartasPorConfirmar, validarManifiesto } from '../lib/manifest'
import { archivoLinks, relacionesDesdeTexto, validarRelaciones } from '../lib/links'
import { guardarRelacionesDeAdmin } from '../lib/ajustesAdmin'
import { presentacionDe } from '../lib/mazos'
import { extraidas, totalDeMazo, type Progreso } from '../lib/progress'
import { ORDEN_MAZOS, type Carta, type DeckId, type RelacionPracticaTeorica } from '../lib/types'

interface Props {
  progreso: Progreso
  relaciones: readonly RelacionPracticaTeorica[]
  hayAjustesLocales: boolean
  onAplicarRelaciones: (relaciones: RelacionPracticaTeorica[]) => void
  onRestaurarRelaciones: () => void
  onReiniciarMazo: (mazo: DeckId) => void
  onReiniciarTodo: () => void
}

type Cara = 'cover' | 'content'

interface Diagnostico {
  enCurso: boolean
  revisadas: number
  total: number
  fallas: string[]
}

interface Previsualizacion {
  nombre: string
  url: string
  ancho: number
  alto: number
  tipo: string
}

const CARAS: { valor: Cara; etiqueta: string }[] = [
  { valor: 'cover', etiqueta: 'Cara ilustrada (coverImage)' },
  { valor: 'content', etiqueta: 'Contenido (contentImage)' },
]

function nombreDeArchivo(ruta: string): string {
  return ruta.split('/').pop() ?? ruta
}

function cargarImagen(url: string): Promise<boolean> {
  return new Promise((resolver) => {
    const imagen = new Image()
    imagen.onload = () => resolver(true)
    imagen.onerror = () => resolver(false)
    imagen.src = url
  })
}

/**
 * Administración local. NO hay backend: acá se valida el material, se editan los
 * vínculos en este navegador y se preparan los archivos para reemplazarlos a mano.
 * Subir un archivo desde el navegador nunca actualiza el servidor: eso se hace
 * copiando el PNG a la carpeta `cartas/` y volviendo a desplegar.
 */
export function PanelAdmin({
  progreso,
  relaciones,
  hayAjustesLocales,
  onAplicarRelaciones,
  onRestaurarRelaciones,
  onReiniciarMazo,
  onReiniciarTodo,
}: Props) {
  const validacion = useMemo(() => validarManifiesto(), [])
  const erroresDeVinculos = useMemo(() => validarRelaciones(relaciones), [relaciones])
  const porConfirmar = useMemo(() => cartasPorConfirmar(), [])

  const [textoLinks, setTextoLinks] = useState(() =>
    JSON.stringify({ ...archivoLinks, relaciones: [...relaciones] }, null, 2),
  )
  const [mensajeLinks, setMensajeLinks] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const [diagnostico, setDiagnostico] = useState<Diagnostico | null>(null)

  const [objetivoMazo, setObjetivoMazo] = useState<DeckId>('grupal')
  const cartasDelMazo = useMemo(() => CARTAS.filter((c) => c.deck === objetivoMazo), [objetivoMazo])
  const [objetivoCartaId, setObjetivoCartaId] = useState('G01')
  const [objetivoCara, setObjetivoCara] = useState<Cara>('cover')
  const [previsualizacion, setPrevisualizacion] = useState<Previsualizacion | null>(null)
  const [avisoCopia, setAvisoCopia] = useState<string | null>(null)

  const previsualizacionRef = useRef<Previsualizacion | null>(null)
  previsualizacionRef.current = previsualizacion
  useEffect(
    () => () => {
      if (previsualizacionRef.current) URL.revokeObjectURL(previsualizacionRef.current.url)
    },
    [],
  )

  useEffect(() => {
    const primera = CARTAS.find((c) => c.deck === objetivoMazo)
    if (primera) setObjetivoCartaId(primera.id)
  }, [objetivoMazo])

  const cartaObjetivo: Carta | undefined = cartasDelMazo.find((c) => c.id === objetivoCartaId)
  const rutaObjetivo = cartaObjetivo
    ? objetivoCara === 'cover'
      ? cartaObjetivo.coverImage
      : cartaObjetivo.contentImage
    : ''

  const aplicarLinks = () => {
    const { relaciones: nuevas, errores } = relacionesDesdeTexto(textoLinks)
    if (errores.length > 0) {
      setMensajeLinks({ tipo: 'error', texto: errores.join(' ') })
      return
    }
    const problemas = validarRelaciones(nuevas)
    if (problemas.length > 0) {
      setMensajeLinks({ tipo: 'error', texto: problemas.join(' ') })
      return
    }
    guardarRelacionesDeAdmin(nuevas)
    onAplicarRelaciones(nuevas)
    setMensajeLinks({
      tipo: 'ok',
      texto: `Se aplicaron ${nuevas.length} vínculos en este navegador. Los archivos del proyecto no cambiaron.`,
    })
  }

  const validarLinks = () => {
    const { relaciones: nuevas, errores } = relacionesDesdeTexto(textoLinks)
    if (errores.length > 0) {
      setMensajeLinks({ tipo: 'error', texto: errores.join(' ') })
      return
    }
    const problemas = validarRelaciones(nuevas)
    setMensajeLinks(
      problemas.length > 0
        ? { tipo: 'error', texto: problemas.join(' ') }
        : { tipo: 'ok', texto: `El JSON es válido: ${nuevas.length} vínculos, todos con IDs existentes.` },
    )
  }

  const descargarLinks = () => {
    const blob = new Blob([textoLinks], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = 'links.json'
    enlace.click()
    URL.revokeObjectURL(url)
    setMensajeLinks({
      tipo: 'ok',
      texto: 'Descargado. Reemplazá con ese archivo src/data/links.json para dejarlo fijo en el proyecto.',
    })
  }

  const restaurarLinks = () => {
    const base = JSON.stringify({ ...archivoLinks }, null, 2)
    setTextoLinks(base)
    onRestaurarRelaciones()
    setMensajeLinks({ tipo: 'ok', texto: 'Se volvieron los vínculos del archivo del proyecto.' })
  }

  const verificarImagenes = async () => {
    const rutas = [...new Set(CARTAS.flatMap((carta) => [carta.coverImage, carta.contentImage]))]
    setDiagnostico({ enCurso: true, revisadas: 0, total: rutas.length, fallas: [] })
    const fallas: string[] = []
    let revisadas = 0
    let indice = 0
    const trabajadores = Array.from({ length: Math.min(6, rutas.length) }, async () => {
      while (indice < rutas.length) {
        const ruta = rutas[indice++]
        const carga = await cargarImagen(urlDeCarta(ruta))
        revisadas += 1
        if (!carga) fallas.push(ruta)
        setDiagnostico({ enCurso: true, revisadas, total: rutas.length, fallas: [...fallas] })
      }
    })
    await Promise.all(trabajadores)
    setDiagnostico({ enCurso: false, revisadas, total: rutas.length, fallas })
  }

  const elegirArchivo = (archivo: File | null) => {
    if (previsualizacion) URL.revokeObjectURL(previsualizacion.url)
    if (!archivo) {
      setPrevisualizacion(null)
      return
    }
    const url = URL.createObjectURL(archivo)
    const imagen = new Image()
    imagen.onload = () =>
      setPrevisualizacion({ nombre: archivo.name, url, ancho: imagen.naturalWidth, alto: imagen.naturalHeight, tipo: archivo.type || 'desconocido' })
    imagen.onerror = () =>
      setPrevisualizacion({ nombre: archivo.name, url, ancho: 0, alto: 0, tipo: archivo.type || 'desconocido' })
    imagen.src = url
  }

  const copiarRuta = async (texto: string) => {
    try {
      await navigator.clipboard.writeText(texto)
      setAvisoCopia('Ruta copiada al portapapeles.')
    } catch {
      setAvisoCopia('No se pudo copiar automáticamente: seleccioná la ruta y copiala a mano.')
    }
  }

  return (
    <div className="admin">
      <header className="admin__encabezado">
        <h1 className="admin__titulo">Administración local</h1>
        <p className="admin__bajada">
          Esta pantalla funciona sin backend. Todo lo que edites acá queda guardado únicamente en este navegador y
          no modifica los archivos del proyecto ni ningún servidor. Para dejar un cambio fijo hay que reemplazar el
          archivo correspondiente y volver a desplegar.
        </p>
      </header>

      <section className="panel" aria-labelledby="admin-estado">
        <h2 className="panel__titulo" id="admin-estado">
          Estado del material
        </h2>
        <ul className="lista-estado">
          {validacion.resumen.map((fila) => (
            <li key={fila.mazo} className={fila.declaradas === fila.encontradas ? 'es-ok' : 'es-error'}>
              <strong>{presentacionDe(fila.mazo).nombre}</strong>: {fila.encontradas} de {fila.declaradas} cartas en el
              manifiesto.
            </li>
          ))}
        </ul>

        {validacion.errores.length > 0 ? (
          <div className="aviso aviso--error">
            <p className="aviso__titulo">Errores del manifiesto</p>
            <ul>
              {validacion.errores.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="texto-ok">
            El manifiesto está completo: 30 cartas Grupales, 15 Individuales y 16 Teóricas, todas con sus dos caras.
          </p>
        )}

        {validacion.advertencias.length > 0 ? (
          <div className="aviso aviso--atencion">
            <p className="aviso__titulo">A revisar</p>
            <ul>
              {validacion.advertencias.map((aviso) => (
                <li key={aviso}>{aviso}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {porConfirmar.length > 0 ? (
          <details className="panel__detalle">
            <summary>{porConfirmar.length} cartas con la pareja de caras por confirmar</summary>
            <ul className="lista-detalle">
              {porConfirmar.map((carta) => (
                <li key={carta.id}>
                  <strong>{carta.id}</strong>: {carta.coverImage.split('/').pop()} +{' '}
                  {carta.contentImage.split('/').pop()}
                  {carta.nota ? <em> — {carta.nota}</em> : null}
                </li>
              ))}
            </ul>
          </details>
        ) : null}

        {erroresDeVinculos.length > 0 ? (
          <div className="aviso aviso--error">
            <p className="aviso__titulo">Vínculos con problemas</p>
            <ul>
              {erroresDeVinculos.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="texto-ok">
            Los {relaciones.length} vínculos cargados apuntan a cartas existentes. Recordá que siguen siendo
            provisorios hasta que cierre la curaduría.
          </p>
        )}
      </section>

      <section className="panel" aria-labelledby="admin-diagnostico">
        <h2 className="panel__titulo" id="admin-diagnostico">
          Diagnóstico de imágenes
        </h2>
        <p>
          Recorre las {CARTAS.length * 2} caras del manifiesto y avisa cuáles no cargan. Sirve después de
          renombrar o mover PNG.
        </p>
        <button type="button" className="boton boton--secundario" onClick={verificarImagenes} disabled={diagnostico?.enCurso}>
          {diagnostico?.enCurso ? 'Verificando…' : 'Verificar todas las imágenes'}
        </button>
        {diagnostico ? (
          <div className="diagnostico" role="status">
            <p>
              Revisadas {diagnostico.revisadas} de {diagnostico.total}.{' '}
              {diagnostico.enCurso ? 'En curso…' : `${diagnostico.fallas.length} con problemas.`}
            </p>
            {diagnostico.fallas.length > 0 ? (
              <ul className="lista-detalle">
                {diagnostico.fallas.map((falla) => (
                  <li key={falla}>
                    <code>{falla}</code>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="panel" aria-labelledby="admin-vinculos">
        <h2 className="panel__titulo" id="admin-vinculos">
          Editar vínculos (links.json)
        </h2>
        <p>
          Formato: <code>{'{ "practica": "G01", "teoricas": ["T01"], "provisorio": true }'}</code>. Una carta
          práctica puede tener 0, 1 o varias Teóricas. Los IDs son estables y no dependen de los nombres de archivo.
        </p>
        {hayAjustesLocales ? (
          <p className="aviso-inline">
            Estás viendo vínculos editados en este navegador (por encima del archivo del proyecto).
          </p>
        ) : null}
        <label className="etiqueta" htmlFor="editor-links">
          Contenido de links.json
        </label>
        <textarea
          id="editor-links"
          className="editor"
          value={textoLinks}
          spellCheck={false}
          rows={16}
          onChange={(evento) => setTextoLinks(evento.target.value)}
        />
        <div className="panel__acciones">
          <button type="button" className="boton boton--secundario" onClick={validarLinks}>
            Validar
          </button>
          <button type="button" className="boton boton--principal" onClick={aplicarLinks}>
            Aplicar en este navegador
          </button>
          <button type="button" className="boton boton--secundario" onClick={descargarLinks}>
            Descargar links.json
          </button>
          <button type="button" className="boton boton--peligro" onClick={restaurarLinks}>
            Volver al archivo del proyecto
          </button>
        </div>
        {mensajeLinks ? (
          <p className={mensajeLinks.tipo === 'ok' ? 'texto-ok' : 'texto-error'} role="status">
            {mensajeLinks.texto}
          </p>
        ) : null}
        <details className="panel__detalle">
          <summary>Cómo dejarlo fijo y desplegarlo</summary>
          <ol className="lista-pasos">
            <li>Descargá el JSON con el botón de arriba.</li>
            <li>Reemplazá <code>src/data/links.json</code> del proyecto con ese archivo.</li>
            <li>Volvé a compilar y desplegar (<code>npm run build</code>).</li>
            <li>Si algún día hay backend, esta pantalla necesita autenticación: hoy no la tiene porque no hay servidor que reciba cambios.</li>
          </ol>
        </details>
      </section>

      <section className="panel" aria-labelledby="admin-imagenes">
        <h2 className="panel__titulo" id="admin-imagenes">
          Reemplazar imágenes
        </h2>
        <p>
          Elegí qué cara vas a reemplazar, mirá la previsualización del archivo nuevo y copiá la ruta exacta donde
          tiene que quedar. El navegador no puede escribir en el servidor: guardá el PNG con ese nombre dentro de{' '}
          <code>cartas/</code> y volvé a desplegar.
        </p>
        <div className="formulario">
          <label className="etiqueta" htmlFor="admin-mazo">
            Mazo
          </label>
          <select
            id="admin-mazo"
            value={objetivoMazo}
            onChange={(evento) => setObjetivoMazo(evento.target.value as DeckId)}
          >
            {ORDEN_MAZOS.map((mazo) => (
              <option key={mazo} value={mazo}>
                {presentacionDe(mazo).nombre}
              </option>
            ))}
          </select>

          <label className="etiqueta" htmlFor="admin-carta">
            Carta
          </label>
          <select
            id="admin-carta"
            value={objetivoCartaId}
            onChange={(evento) => setObjetivoCartaId(evento.target.value)}
          >
            {cartasDelMazo.map((carta) => (
              <option key={carta.id} value={carta.id}>
                {carta.id}
              </option>
            ))}
          </select>

          <label className="etiqueta" htmlFor="admin-cara">
            Cara
          </label>
          <select
            id="admin-cara"
            value={objetivoCara}
            onChange={(evento) => setObjetivoCara(evento.target.value as Cara)}
          >
            {CARAS.map((cara) => (
              <option key={cara.valor} value={cara.valor}>
                {cara.etiqueta}
              </option>
            ))}
          </select>

          <label className="etiqueta" htmlFor="admin-archivo">
            Archivo nuevo (PNG, 827 × 1181)
          </label>
          <input
            id="admin-archivo"
            type="file"
            accept="image/png,image/*"
            onChange={(evento) => elegirArchivo(evento.target.files?.[0] ?? null)}
          />
        </div>

        {rutaObjetivo ? (
          <div className="destino">
            <p className="destino__etiqueta">Ruta exacta del archivo a reemplazar</p>
            <code className="destino__ruta">{rutaObjetivo}</code>
            <p className="destino__carpeta">
              Dentro de la carpeta <code>cartas/</code>, con el nombre <code>{nombreDeArchivo(rutaObjetivo)}</code>.
            </p>
            <button type="button" className="boton boton--secundario" onClick={() => copiarRuta(nombreDeArchivo(rutaObjetivo))}>
              Copiar nombre del archivo
            </button>
            {avisoCopia ? <p className="texto-ok">{avisoCopia}</p> : null}
          </div>
        ) : null}

        {previsualizacion ? (
          <div className="previsualizacion">
            <p className="previsualizacion__etiqueta">
              Previsualización de <code>{previsualizacion.nombre}</code> ({previsualizacion.tipo}
              {previsualizacion.ancho
                ? `, ${previsualizacion.ancho} × ${previsualizacion.alto} px`
                : ', no se pudo leer el tamaño'})
            </p>
            <img className="previsualizacion__imagen" src={previsualizacion.url} alt={`Previsualización de ${previsualizacion.nombre}`} />
            {previsualizacion.ancho && (previsualizacion.ancho !== 827 || previsualizacion.alto !== 1181) ? (
              <p className="aviso-inline">
                Ojo: el material actual mide 827 × 1181 px. Si las dimensiones no coinciden, la carta puede
                recortarse.
              </p>
            ) : null}
            <p className="previsualizacion__nota">
              Esta previsualización es solo para revisar el archivo. El juego sigue mostrando la imagen actual hasta
              que reemplaces el PNG y vuelvas a desplegar.
            </p>
          </div>
        ) : null}
      </section>

      <section className="panel" aria-labelledby="admin-progreso">
        <h2 className="panel__titulo" id="admin-progreso">
          Progreso de las partidas
        </h2>
        <p>El progreso se guarda por mazo en este navegador y no se repite ninguna carta hasta reiniciar.</p>
        <ul className="lista-estado">
          {ORDEN_MAZOS.map((mazo) => (
            <li key={mazo}>
              <strong>{presentacionDe(mazo).nombre}</strong>: {extraidas(progreso, mazo).length} de{' '}
              {totalDeMazo(progreso, mazo)} extraídas.
              <button type="button" className="boton boton--mini" onClick={() => onReiniciarMazo(mazo)}>
                Reiniciar mazo
              </button>
            </li>
          ))}
        </ul>
        <button type="button" className="boton boton--peligro" onClick={onReiniciarTodo}>
          Reiniciar todo el progreso
        </button>
      </section>
    </div>
  )
}
