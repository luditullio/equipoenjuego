import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

import '../recursos/tokens.css'
import './estilos/base.css'
import './estilos/inicio.css'
import './estilos/juego.css'
import './estilos/cartas.css'
import './estilos/modal.css'
import './estilos/biblioteca.css'
import './estilos/editorial.css'
import './estilos/controles.css'

const contenedor = document.getElementById('root')
if (!contenedor) throw new Error('No se encontró el nodo #root.')

createRoot(contenedor).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
