/**
 * Envoltorio mínimo sobre `localStorage` con respaldo en memoria.
 * Si el navegador bloquea el almacenamiento (modo privado, permisos), el juego sigue
 * funcionando durante la sesión en vez de romperse.
 */
export interface Almacen {
  obtener(clave: string): string | null
  guardar(clave: string, valor: string): void
  borrar(clave: string): void
}

function crearRespaldoEnMemoria(): Almacen {
  const memoria = new Map<string, string>()
  return {
    obtener: (clave) => memoria.get(clave) ?? null,
    guardar: (clave, valor) => void memoria.set(clave, valor),
    borrar: (clave) => void memoria.delete(clave),
  }
}

export function crearAlmacen(): Almacen {
  try {
    const prueba = '__prueba__'
    window.localStorage.setItem(prueba, '1')
    window.localStorage.removeItem(prueba)
    return {
      obtener: (clave) => window.localStorage.getItem(clave),
      guardar: (clave, valor) => window.localStorage.setItem(clave, valor),
      borrar: (clave) => window.localStorage.removeItem(clave),
    }
  } catch {
    return crearRespaldoEnMemoria()
  }
}

export const almacen = crearAlmacen()
