import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { ROUTES } from '@/routes/paths.js'

export function ProtectedRoute({ allowedRoles, children }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()
  const userRole = String(user?.role ?? '').replace('ROLE_', '').toUpperCase()

  if (!isAuthenticated) {
    return (
      <Navigate
        replace
        to={ROUTES.login}
        state={{ from: location.pathname }}
      />
    )
  }

  if (allowedRoles?.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate replace to={ROUTES.forbidden} />
  }

  return children
}
