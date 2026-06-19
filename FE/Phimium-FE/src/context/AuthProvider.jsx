import { useCallback, useMemo, useState } from 'react'

import { STORAGE_KEYS, USER_ROLES } from '@/constants/app.js'
import { AuthContext } from '@/context/authContext.js'

const normalizeToken = (token) => {
  if (!token || token === 'undefined' || token === 'null') {
    return ''
  }

  return token
}

const clearStoredAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.token)
  localStorage.removeItem(STORAGE_KEYS.user)
  sessionStorage.removeItem(STORAGE_KEYS.authSession)
}

const readStoredUser = () => {
  const hasActiveSession =
    sessionStorage.getItem(STORAGE_KEYS.authSession) === 'true'
  const token = normalizeToken(localStorage.getItem(STORAGE_KEYS.token))
  const storedUser = localStorage.getItem(STORAGE_KEYS.user)

  if (!hasActiveSession || !token || !storedUser) {
    clearStoredAuth()
    return null
  }

  try {
    return JSON.parse(storedUser)
  } catch {
    clearStoredAuth()
    return null
  }
}

const extractAuthData = (loginResponse) => {
  const payload = loginResponse?.data ?? loginResponse
  const rawRole = payload?.role ?? payload?.authorities?.[0] ?? USER_ROLES.user

  return {
    token: normalizeToken(payload?.token ?? payload?.accessToken ?? payload?.jwt),
    username: payload?.username ?? payload?.name ?? payload?.email ?? '',
    role: String(rawRole).replace('ROLE_', '').toUpperCase(),
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser())

  const login = useCallback((loginResponse) => {
    const authData = extractAuthData(loginResponse)

    if (authData.token) {
      localStorage.setItem(STORAGE_KEYS.token, authData.token)
    } else {
      localStorage.removeItem(STORAGE_KEYS.token)
    }

    sessionStorage.setItem(STORAGE_KEYS.authSession, 'true')

    const userInfo = {
      username: authData.username,
      role: authData.role,
    }

    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(userInfo))
    setUser(userInfo)
  }, [])

  const logout = useCallback(() => {
    clearStoredAuth()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(
        user && normalizeToken(localStorage.getItem(STORAGE_KEYS.token)),
      ),
      login,
      logout,
    }),
    [login, logout, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
