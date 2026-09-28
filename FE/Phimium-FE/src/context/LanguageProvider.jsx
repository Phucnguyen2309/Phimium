import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'

import { DEFAULT_LANGUAGE, STORAGE_KEYS } from '@/constants/app.js'
import { LanguageContext } from '@/context/languageContext.js'
import {
  isSupportedLanguage,
  setCurrentLanguage,
  translate,
} from '@/utils/i18n.js'

const readStoredLanguage = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.language)
    return isSupportedLanguage(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const initialLanguage = readStoredLanguage()
    setCurrentLanguage(initialLanguage)
    return initialLanguage
  })

  const setLanguage = useCallback((nextLanguage) => {
    if (!isSupportedLanguage(nextLanguage)) return

    // Cập nhật ngôn ngữ cho mapper / utils trước khi render lại
    setCurrentLanguage(nextLanguage)

    try {
      localStorage.setItem(STORAGE_KEYS.language, nextLanguage)
    } catch {
      // Bỏ qua nếu trình duyệt chặn storage
    }

    setLanguageState(nextLanguage)
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key, params) => translate(language, key, params),
    }),
    [language, setLanguage],
  )

  // key={language}: đổi ngôn ngữ thì mount lại app để dữ liệu đã map
  // (mapper, format ngày / tiền) được tính lại theo ngôn ngữ mới.
  return (
    <LanguageContext.Provider value={value}>
      <Fragment key={language}>{children}</Fragment>
    </LanguageContext.Provider>
  )
}
