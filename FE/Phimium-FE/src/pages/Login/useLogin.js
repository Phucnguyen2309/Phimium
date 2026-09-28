import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { getDefaultRouteByRole, ROUTES } from '@/routes/paths.js'
import authService from '@/services/authService.js'

export function useLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const { t } = useLanguage()
  const fromPath = location.state?.from || ROUTES.home

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const responseData = await authService.login(email, password)
      login(responseData)
      const payload = responseData?.data ?? responseData
      const defaultPath = getDefaultRouteByRole(
        payload?.role ?? payload?.authorities?.[0],
      )

      navigate(fromPath === ROUTES.home ? defaultPath : fromPath, {
        replace: true,
      })
    } catch (err) {
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
