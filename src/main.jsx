import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './Depth.css'
import App from './App.jsx'
import { CursorHalo } from './Depth.jsx'
import { startSmoothScroll } from './smoothScroll.js'

startSmoothScroll()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <CursorHalo />
  </StrictMode>,
)
