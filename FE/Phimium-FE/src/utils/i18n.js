import { DEFAULT_LANGUAGE, LANGUAGES } from '@/constants/app.js'
import en from '@/locales/en.js'
import vi from '@/locales/vi.js'

/**
 * i18n thuần JS (không phụ thuộc React).
 * - Component: dùng `const { t } = useLanguage()` từ '@/context/languageContext.js'.
 * - Mapper / utils / service: import `t` từ file này.
 * Ngôn ngữ hiện tại do LanguageProvider đặt qua setCurrentLanguage().
 */
const DICTIONARIES = {
  [LANGUAGES.vi]: vi,
  [LANGUAGES.en]: en,
}

const LOCALES = {
  [LANGUAGES.vi]: 'vi-VN',
  [LANGUAGES.en]: 'en-US',
}

let currentLanguage = DEFAULT_LANGUAGE

export const isSupportedLanguage = (language) =>
  Object.values(LANGUAGES).includes(language)

export const getCurrentLanguage = () => currentLanguage

export const setCurrentLanguage = (language) => {
  currentLanguage = isSupportedLanguage(language) ? language : DEFAULT_LANGUAGE
}

/** Locale cho Intl / toLocaleString, VD 'vi-VN' | 'en-US' */
export const getLocale = (language = currentLanguage) =>
  LOCALES[language] ?? LOCALES[DEFAULT_LANGUAGE]

const resolveKey = (dictionary, key) =>
  key.split('.').reduce((node, part) => node?.[part], dictionary)

const interpolate = (text, params) =>
  text.replace(/\{(\w+)\}/g, (match, name) =>
    params[name] === undefined || params[name] === null ? match : String(params[name]),
  )

/**
 * Dịch theo key dạng 'home.hero.title'.
 * Tham số: t('buddy.activityCount', { count: 3 }) với chuỗi '{count} hoạt động'.
 * Thiếu key ở ngôn ngữ hiện tại -> lấy tiếng Việt -> trả lại chính key.
 */
export const translate = (language, key, params = {}) => {
  const value =
    resolveKey(DICTIONARIES[language], key) ??
    resolveKey(DICTIONARIES[DEFAULT_LANGUAGE], key)

  if (typeof value !== 'string') return key

  return interpolate(value, params)
}

export const t = (key, params) => translate(currentLanguage, key, params)
