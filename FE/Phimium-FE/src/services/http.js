import axios from 'axios'

// Token đăng nhập nằm trong cookie HttpOnly do Backend đặt -> JavaScript không đọc được,
// trình duyệt tự gửi kèm. FE gọi API cùng domain qua '/api' (Vercel rewrite / Vite proxy)
// nên cookie là cookie first-party.
const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const AUTH_EXPIRED_EVENT = 'phimium:auth-expired'

// Các API đăng nhập / làm mới token: lỗi 401 là lỗi thật, không thử refresh
const SKIP_REFRESH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/complete-profile',
  '/auth/refresh',
  '/auth/logout',
  '/auth/verify-otp',
  '/auth/resend-otp',
]

let refreshPromise = null

// Gộp nhiều request 401 cùng lúc thành 1 lần gọi refresh
const refreshSession = () => {
  if (!refreshPromise) {
    refreshPromise = http.post('/auth/refresh').finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config
    const status = error?.response?.status
    const url = config?.url ?? ''

    if (status !== 401 || !config || config._retried || SKIP_REFRESH_PATHS.some((path) => url.startsWith(path))) {
      return Promise.reject(error)
    }

    // Request tự gắn Authorization (VD onboarding token Google) thì không refresh
    if (config.headers?.Authorization) {
      return Promise.reject(error)
    }

    try {
      await refreshSession()
    } catch {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
      return Promise.reject(error)
    }

    config._retried = true
    return http(config)
  },
)

export default http
