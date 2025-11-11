import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './styles/responsive.css'
import { setupConsoleFilter } from './utils/consoleFilter'

// Configurar filtro de consola para ignorar errores de extensiones
if (import.meta.env.DEV) {
  setupConsoleFilter();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)


