import { createContext, useContext } from 'react'

export const LanguageContext = createContext(null)

/** { language, setLanguage, t } – dùng trong mọi component có chữ hiển thị. */
export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
