import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ConfigProvider } from 'antd'

import '@/index.css'
import App from '@/app/App.jsx'
import { AuthProvider } from '@/context/AuthProvider.jsx'
import { LanguageProvider } from '@/context/LanguageProvider.jsx'

// Màu / font của antd theo bộ nhận diện Phimium (navy + vàng, Be Vietnam Pro)
const ANTD_THEME = {
  token: {
    colorPrimary: '#162456',
    colorError: '#dc2626',
    fontFamily: "'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif",
    borderRadius: 12,
  },
  components: {
    Modal: { borderRadiusLG: 24, titleFontSize: 18 },
  },
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider theme={ANTD_THEME}>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </ConfigProvider>
  </StrictMode>,
)
