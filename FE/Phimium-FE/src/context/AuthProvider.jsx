import { useCallback, useEffect, useMemo, useState } from 'react'

import { LEGACY_AUTH_STORAGE_KEYS, USER_ROLES } from '@/constants/app.js'
import { AuthContext } from '@/context/authContext.js'
import authService from '@/services/authService.js'
import { AUTH_EXPIRED_EVENT } from '@/services/http.js'
import { getResponseData } from '@/utils/response.js'
import { normalizeRole } from '@/utils/role.js'

// Bản cũ lưu token trong localStorage -> dọn đi để không còn token nằm trong trình duyệt
const clearLegacyStorage = () => {
  try {
    LEGACY_AUTH_STORAGE_KEYS.forEach((key) => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  } catch {
    // Trình duyệt chặn storage -> bỏ qua
  }
}

// GET /auth/me -> thông tin hiển thị (không có token)
const toUser = (me) => {
  if (!me) return null

  return {
    userId: me.userId,
    username: me.username ?? '',
    fullName: me.fullName ?? '',
    role: normalizeRole(me.role ?? USER_ROLES.user),
    buddyId: me.buddyId ?? undefined,
  }
}

/**
 * Phiên đăng nhập dùng cookie HttpOnly do Backend đặt. FE không giữ token,
 * chỉ giữ thông tin người dùng trong bộ nhớ và hỏi lại Backend khi tải trang.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)

  const loadCurrentUser = useCallback(async () => {
    try {
      const nextUser = toUser(getResponseData(await authService.me()))
      setUser(nextUser)
      return nextUser
    } catch {
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    clearLegacyStorage()

    let active = true

    authService
      .me()
      .then((response) => {
        if (active) setUser(toUser(getResponseData(response)))
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsInitializing(false)
      })

    // Refresh token cũng hết hạn -> về trạng thái chưa đăng nhập
    const handleExpired = () => setUser(null)
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired)

    return () => {
      active = false
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired)
    }
  }, [])

  /**
   * Gọi sau khi API đăng nhập thành công (cookie đã được đặt).
   * Trả về user để trang đăng nhập điều hướng theo role.
   */
  const login = useCallback(() => loadCurrentUser(), [loadCurrentUser])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Mất mạng / token hỏng: vẫn đăng xuất phía giao diện
    }

    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isInitializing,
      login,
      logout,
      refreshUser: loadCurrentUser,
    }),
    [isInitializing, loadCurrentUser, login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
