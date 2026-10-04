import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { ROUTES } from '@/routes/paths.js'
import { normalizeRole } from '@/utils/role.js'

export function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, isInitializing, user } = useAuth()
  const location = useLocation()
  const userRole = normalizeRole(user?.role)

  // Đang hỏi Backend phiên đăng nhập (cookie) -> chưa điều hướng về trang đăng nhập
  if (isInitializing) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-950 border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <Navigate replace to={ROUTES.login} state={{ from: location.pathname }} />
    )
  }

  if (allowedRoles?.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate replace to={ROUTES.forbidden} />
  }

  return children
}
