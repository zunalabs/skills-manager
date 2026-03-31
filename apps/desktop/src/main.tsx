import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { TooltipProvider } from './components/ui/Tooltip'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
    </TooltipProvider>
  </React.StrictMode>
)
