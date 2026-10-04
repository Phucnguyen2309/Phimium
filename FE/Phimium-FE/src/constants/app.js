export const APP_NAME = 'Phimium'

// Google OAuth Client ID (cấu hình trong .env: VITE_GOOGLE_CLIENT_ID)
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? ''

export const STORAGE_KEYS = {
  language: 'phimium_language',
}

// Khoá cũ từng lưu token / user trong storage. Token giờ nằm trong cookie HttpOnly,
// AuthProvider chỉ dùng danh sách này để xoá dữ liệu cũ còn sót lại.
export const LEGACY_AUTH_STORAGE_KEYS = ['token', 'user', 'phimium_auth_session']

export const USER_ROLES = {
  user: 'USER',
  buddy: 'BUDDY',
  admin: 'ADMIN',
}

// Mã lỗi `code` trong body lỗi của Backend (ErrorCode.java)
export const AUTH_ERROR_CODES = {
  emailNotVerified: 1005,
  otpNotFound: 10001,
  otpExpired: 10002,
  otpTooManyAttempts: 10003,
  otpInvalid: 10004,
  otpAlreadyVerified: 10005,
  otpResendTooSoon: 10006,
}

// Khớp với EmailOtpServiceImpl của Backend
export const OTP_CONFIG = {
  length: 6,
  resendSeconds: 60,
  expireMinutes: 5,
}

export const LANGUAGES = {
  vi: 'vi',
  en: 'en',
}

export const DEFAULT_LANGUAGE = LANGUAGES.vi
