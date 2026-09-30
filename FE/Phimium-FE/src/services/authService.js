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
  apiError.code = data?.code
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

  /** Đăng nhập / đăng ký bằng Google. credential: Google ID token từ Google Identity Services */
  googleAuth: async (credential) => {
    try {
      const response = await http.post('/auth/google', { credential })
      return response.data
    } catch (error) {
      throw toApiError(error, t('auth.google.failed'))
    }
  },

  /** Hoàn tất hồ sơ cho tài khoản Google mới (Bearer onboardingToken) */
  completeProfile: async (onboardingToken, profile) => {
    try {
      const response = await http.post('/auth/complete-profile', profile, {
        headers: { Authorization: `Bearer ${onboardingToken}` },
      })
      return response.data
    } catch (error) {
      throw toApiError(error, t('auth.completeProfile.failed'))
    }
  },

  /** Xác thực email bằng mã OTP 6 số gửi qua email sau khi đăng ký */
  verifyOtp: async (email, otp) => {
    try {
      const response = await http.post('/auth/verify-otp', { email, otp })
      return response.data
    } catch (error) {
      throw toApiError(error, t('auth.verifyEmail.failed'))
    }
  },

  /** Gửi lại mã OTP (Backend chặn nếu gửi lại trong vòng 60 giây) */
  resendOtp: async (email) => {
    try {
      const response = await http.post('/auth/resend-otp', { email })
      return response.data
    } catch (error) {
      throw toApiError(error, t('auth.verifyEmail.resendFailed'))
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
