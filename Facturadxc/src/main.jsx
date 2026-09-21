import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { UsuarioAppJT } from './UsuarioAppJT'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UsuarioAppJT />
  </StrictMode>,
)
