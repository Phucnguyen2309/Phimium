import { getCurrentLanguage, t } from '@/utils/i18n.js'

/**
 * Helpers đọc dữ liệu trả về từ API (axios response).
 * BE có thể trả { data: [...] }, { data: { data: [...] } } hoặc Spring Data Page { data: { data: { content: [...] } } }.
 */
export const safeList = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.content)) return value.content
  if (Array.isArray(value?.items)) return value.items
  if (Array.isArray(value?.data)) return value.data
  return []
}

export const getResponseData = (response) =>
  response?.data?.data ?? response?.data ?? response ?? null

export const getResponseList = (response) => {
  const root = response?.data?.data ?? response?.data ?? response
  return safeList(root)
}

// Một vài mã lỗi Backend bị dùng chung cho 2 lỗi -> phân biệt bằng message gốc
const AMBIGUOUS_CODES = {
  1005: (message) => (message.includes('UserId') ? 'userIdNotFound' : 'emailNotVerified'),
  6001: (message) => (message.includes('Gemini') ? 'aiNotConfigured' : 'guidelineNotFound'),
  9001: (message) => (/validation|invalid request/i.test(message) ? 'validation' : 'paymentNotFound'),
}

/**
 * Dịch lỗi Backend theo mã (`code` trong ApiResponse) sang ngôn ngữ hiện tại.
 * Thiếu bản dịch -> trả '' để dùng message gốc của Backend.
 */
const translateApiError = (code, message = '') => {
  if (code === undefined || code === null) return ''

  const name = AMBIGUOUS_CODES[code]?.(String(message)) ?? String(code)
  const key = `apiErrors.${name}`
  const text = t(key)

  return text === key ? '' : text
}

/**
 * Trích xuất lỗi chi tiết từ response Backend:
 * - MethodArgumentNotValidException: data = { [field]: "Thông báo lỗi" }
 * - AppException: code + message, dịch theo `code` (locales: apiErrors.*)
 */
export const getErrorMessage = (error, fallbackMessage = t('common.genericError')) => {
  if (!error) return fallbackMessage

  const resData = error?.response?.data

  // 1. Lỗi validation từng trường (MethodArgumentNotValidException).
  // Thông báo trường do Backend viết bằng tiếng Việt -> tiếng Anh thì dùng câu chung.
  if (resData?.data && typeof resData.data === 'object' && !Array.isArray(resData.data)) {
    const fieldMessages = Object.values(resData.data).filter((msg) => typeof msg === 'string' && msg)
    if (fieldMessages.length > 0) {
      return getCurrentLanguage() === 'vi' ? fieldMessages.join('. ') : t('apiErrors.validation')
    }
  }

  // 2. Lỗi nghiệp vụ (AppException): ưu tiên bản dịch theo mã lỗi
  const translated = translateApiError(resData?.code, resData?.message)
  if (translated) return translated

  if (resData?.message) return resData.message

  // Không có response (mất mạng, timeout) -> câu thân thiện thay vì "Network Error"
  if (error?.request && !error?.response) return t('apiErrors.network')

  return error?.message || fallbackMessage
}

/**
 * Trích xuất object chứa lỗi của từng trường: { [fieldName]: "Lỗi cụ thể" }
 */
export const getFieldErrors = (error) => {
  const resData = error?.response?.data
  if (resData?.data && typeof resData.data === 'object' && !Array.isArray(resData.data)) {
    return resData.data
  }
  return {}
}

