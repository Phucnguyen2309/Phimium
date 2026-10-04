import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { getDefaultRouteByRole, ROUTES } from '@/routes/paths.js'
import authService from '@/services/authService.js'
import { getResponseData } from '@/utils/response.js'

export function useCompleteProfile() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const { t } = useLanguage()

  // Dữ liệu do useGoogleAuth truyền sang qua router state (mất khi F5 -> yêu cầu đăng nhập Google lại)
  const onboardingToken = location.state?.onboardingToken ?? ''
  const email = location.state?.email ?? ''
  const fromPath = location.state?.from || ROUTES.home

  const [formData, setFormData] = useState({
    fullName: location.state?.fullName ?? '',
    birthday: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = getResponseData(
        await authService.completeProfile(onboardingToken, formData),
      )

      const currentUser = await login()
      if (!currentUser) throw new Error(t('auth.sessionFailed'))

      const role = currentUser?.role ?? result?.role
      navigate(fromPath === ROUTES.home ? getDefaultRouteByRole(role) : fromPath, {
        replace: true,
      })
    } catch (err) {
      setError(err.message || t('auth.completeProfile.failed'))
    } finally {
      setIsLoading(false)
    }
  }

  return {
    email,
    error,
    formData,
    handleChange,
    handleSubmit,
    hasToken: Boolean(onboardingToken),
    isLoading,
  }
}
