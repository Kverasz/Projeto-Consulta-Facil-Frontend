import React from 'react'
import ReactDOM from 'react-dom/client'

// Fonte instalada pelo npm (funciona offline, importante para PWA)
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'

import './estilos/global.css'
import App from './App.jsx'
import { aplicarPreferencias, lerPreferencias } from './servicos/preferencias'

// Letras maiores e alto contraste valem desde a primeira tela, antes do login
aplicarPreferencias(lerPreferencias())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
