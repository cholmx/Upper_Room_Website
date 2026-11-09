import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import '@fontsource/merriweather/latin-400.css'
import '@fontsource/merriweather/latin-400-italic.css'
import '@fontsource/merriweather/latin-700.css'
import './index.css'
import { initMonitoring } from './lib/monitoring'

initMonitoring()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
