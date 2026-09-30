import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { AUTH_ERROR_CODES, OTP_CONFIG } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'
import authService from '@/services/authService.js'

const OTP_PATTERN = new RegExp(`^\\d{${OTP_CONFIG.length}}$`)

// Mã lỗi Backend -> key thông báo
const VERIFY_ERROR_KEYS = {
  [AUTH_ERROR_CODES.otpInvalid]: 'auth.verifyEmail.errors.invalid',
  [AUTH_ERROR_CODES.otpExpired]: 'auth.verifyEmail.errors.expired',
  [AUTH_ERROR_CODES.otpNotFound]: 'auth.verifyEmail.errors.expired',
  [AUTH_ERROR_CODES.otpTooManyAttempts]: 'auth.verifyEmail.errors.tooManyAttempts',
  [AUTH_ERROR_CODES.otpResendTooSoon]: 'auth.verifyEmail.errors.resendTooSoon',
}

export function useVerifyEmail() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLanguage()

  // Email do trang Đăng ký / Đăng nhập truyền sang. F5 mất state -> cho nhập tay
  const initialEmail = location.state?.email ?? ''
  const otpSent = Boolean(location.state?.otpSent)
  const fromPath = location.state?.from

  const [email, setEmail] = useState(initialEmail)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [shakeKey, setShakeKey] = useState(0)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(otpSent ? OTP_CONFIG.resendSeconds : 0)

  // Đếm ngược thời gian được gửi lại mã
  useEffect(() => {
    if (cooldown <= 0) return undefined

    const timer = setTimeout(() => setCooldown((current) => current - 1), 1000)

    return () => clearTimeout(timer)
  }, [cooldown])

  const goToLogin = (messageKey) => {
    navigate(ROUTES.login, {
      replace: true,
      state: { messageKey, email: email.trim().toLowerCase(), from: fromPath },
    })
  }

  const getErrorMessage = (err, fallbackKey) => {
    const key = VERIFY_ERROR_KEYS[err.code]

    return key ? t(key) : err.message || t(fallbackKey)
  }

  const verify = async (code) => {
    if (isVerifying) return

    if (!email.trim()) {
      setError(t('auth.verifyEmail.errors.missingEmail'))
      return
    }

    setError('')
    setNotice('')
    setIsVerifying(true)

    try {
      await authService.verifyOtp(email.trim(), code)
      goToLogin('auth.verifyEmail.success')
    } catch (err) {
      setError(getErrorMessage(err, 'auth.verifyEmail.failed'))
      setOtp('')
      setShakeKey((current) => current + 1)
      setIsVerifying(false)
    }
  }

  const handleOtpChange = (value) => {
    setOtp(value)
    if (error) setError('')

    // Nhập / dán đủ số thì tự xác thực luôn
    if (OTP_PATTERN.test(value)) verify(value)
  }

  const handleEmailChange = (event) => {
    setEmail(event.target.value)
    if (error) setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!OTP_PATTERN.test(otp)) {
      setError(t('auth.verifyEmail.errors.incomplete', { length: OTP_CONFIG.length }))
      setShakeKey((current) => current + 1)
      return
    }

    verify(otp)
  }

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return

    if (!email.trim()) {
      setError(t('auth.verifyEmail.errors.missingEmail'))
      return
    }

    setError('')
    setNotice('')
    setIsResending(true)

    try {
      await authService.resendOtp(email.trim())
      setOtp('')
      setNotice(t('auth.verifyEmail.resent', { email: email.trim() }))
      setCooldown(OTP_CONFIG.resendSeconds)
    } catch (err) {
      if (err.code === AUTH_ERROR_CODES.otpAlreadyVerified) {
        goToLogin('auth.verifyEmail.alreadyVerified')
        return
      }

      if (err.code === AUTH_ERROR_CODES.otpResendTooSoon) {
        setCooldown(OTP_CONFIG.resendSeconds)
      }

      setError(getErrorMessage(err, 'auth.verifyEmail.resendFailed'))
    } finally {
      setIsResending(false)
    }
  }

  return {
    cooldown,
    email,
    error,
    handleEmailChange,
    handleOtpChange,
    handleResend,
    handleSubmit,
    isEmailLocked: Boolean(initialEmail),
    isResending,
    isVerifying,
    notice,
    otp,
    otpLength: OTP_CONFIG.length,
    otpSent,
    shakeKey,
    expireMinutes: OTP_CONFIG.expireMinutes,
  }
}
