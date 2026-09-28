import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ROUTES } from '@/routes/paths.js'
import { registerUser } from '@/services/authService.js'

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

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await registerUser(formData)
      alert('Đăng ký tài khoản thành công! Vui lòng đăng nhập.')
      navigate(ROUTES.login)
    } catch (err) {
      setError(
        err.message ||
          err.data?.message ||
          'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.',
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
