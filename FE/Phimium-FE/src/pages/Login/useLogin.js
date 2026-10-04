import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AUTH_ERROR_CODES } from '@/constants/app.js'
import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { getDefaultRouteByRole, ROUTES } from '@/routes/paths.js'
import authService from '@/services/authService.js'

export function useLogin() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState(location.state?.email ?? '')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const { t } = useLanguage()
  const fromPath = location.state?.from || ROUTES.home

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const responseData = await authService.login(email, password)
      const currentUser = await login()
      if (!currentUser) throw new Error(t('auth.sessionFailed'))
      const payload = responseData?.data ?? responseData
      const defaultPath = getDefaultRouteByRole(currentUser?.role ?? payload?.role)

      navigate(fromPath === ROUTES.home ? defaultPath : fromPath, {
        replace: true,
      })
    } catch (err) {
      // Tài khoản chưa xác thực email -> chuyển sang trang nhập OTP
      if (err.code === AUTH_ERROR_CODES.emailNotVerified) {
        navigate(ROUTES.verifyEmail, {
          state: { email: email.trim().toLowerCase(), otpSent: false, from: location.state?.from },
        })
        return
      }

      setError(
        err.message ||
          err.data?.message ||
          t('auth.login.invalidCredentials'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    successMessageKey: location.state?.messageKey ?? '',
    error,
    handleLogin,
    isLoading,
    password,
    setEmail,
    setPassword,
  }
}
