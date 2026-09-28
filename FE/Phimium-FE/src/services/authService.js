import http from '@/services/http.js'
import { t } from '@/utils/i18n.js'

/**
 * Chuẩn hoá lỗi từ API về dạng Error có message dễ hiển thị.
 */
const toApiError = (error, defaultMessage) => {
  const data = error?.response?.data
  const message =
    (typeof data === 'string' && data) || data?.message || defaultMessage

  const apiError = new Error(message)
  apiError.status = error?.response?.status
  apiError.data = data

  return apiError
}

const authService = {
  login: async (email, password) => {
    try {
      const response = await http.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw toApiError(error, t('auth.login.failed'))
    }
  },

  register: async (userData) => {
    try {
      const response = await http.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw toApiError(error, t('auth.register.failed'))
    }
  },
}

export default authService
