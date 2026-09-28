import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import '@/index.css'
import App from '@/app/App.jsx'
import { AuthProvider } from '@/context/AuthProvider.jsx'
import { LanguageProvider } from '@/context/LanguageProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
)
