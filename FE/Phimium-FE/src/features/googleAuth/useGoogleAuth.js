import { useCallback, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { getDefaultRouteByRole, getTargetRouteAfterLogin, ROUTES } from '@/routes/paths.js'
import authService from '@/services/authService.js'
import { getResponseData } from '@/utils/response.js'

export const GOOGLE_AUTH_STATUS = {
  authenticated: 'AUTHENTICATED',
  profileRequired: 'PROFILE_REQUIRED',
  accountLinkRequired: 'ACCOUNT_LINK_REQUIRED',
}

/**
 * Xử lý Google ID token sau khi người dùng chọn tài khoản Google:
 * - AUTHENTICATED: đăng nhập luôn.
 * - PROFILE_REQUIRED: chuyển sang trang hoàn tất hồ sơ (kèm onboardingToken).
 * - ACCOUNT_LINK_REQUIRED: email đã có tài khoản mật khẩu -> báo người dùng đăng nhập bằng mật khẩu.
 */
export function useGoogleAuth() {
  const { login } = useAuth()
  const { t } = useLanguage()
  const navigate = useNavigate()
  const location = useLocation()

  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState('')
  const [googleNotice, setGoogleNotice] = useState('')

  const fromPath = location.state?.from || ROUTES.home

  const handleCredential = useCallback(
    async (credential) => {
      if (!credential) return

      setGoogleError('')
      setGoogleNotice('')
      setGoogleLoading(true)

      try {
        const result = getResponseData(await authService.googleAuth(credential)) ?? {}

        if (result.status === GOOGLE_AUTH_STATUS.authenticated) {
          const currentUser = await login()
          if (!currentUser) throw new Error(t('auth.sessionFailed'))

          const role = currentUser?.role
          const targetPath = getTargetRouteAfterLogin(role, fromPath)
          navigate(targetPath, {
            replace: true,
          })
          return
        }

        if (result.status === GOOGLE_AUTH_STATUS.profileRequired) {
          navigate(ROUTES.completeProfile, {
            state: {
              onboardingToken: result.onboardingToken,
              email: result.email,
              fullName: result.fullName,
              from: fromPath,
            },
          })
          return
        }

        if (result.status === GOOGLE_AUTH_STATUS.accountLinkRequired) {
          setGoogleNotice(t('auth.google.linkRequired', { email: result.email ?? '' }))
          return
        }

        setGoogleError(t('auth.google.failed'))
      } catch (err) {
        setGoogleError(err.message || t('auth.google.failed'))
      } finally {
        setGoogleLoading(false)
      }
    },
    [fromPath, login, navigate, t],
  )

  return {
    googleError,
    googleLoading,
    googleNotice,
    handleCredential,
  }
}
