import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'
import authService from '@/services/authService.js'

const initialFormData = {
  fullname: '',
  email: '',
  password: '',
  phone: '',
  birthdate: '',
}

export function useRegister() {
  const [formData, setFormData] = useState(initialFormData)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const { t } = useLanguage()

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authService.register(formData)
      // Backend đã gửi OTP qua email -> sang trang nhập mã
      navigate(ROUTES.verifyEmail, {
        state: { email: formData.email.trim().toLowerCase(), otpSent: true },
      })
    } catch (err) {
      setError(
        err.message ||
          err.data?.message ||
          t('auth.register.invalid'),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    error,
    formData,
    handleChange,
    handleRegister,
    isLoading,
  }
}
