import { USER_ROLES } from '@/constants/app.js'
import { normalizeRole } from '@/utils/role.js'

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  completeProfile: '/complete-profile',
  verifyEmail: '/verify-email',
  paymentResult: '/payment/:result',
  activities: '/activities',
  activityDetail: '/activities/:id',
  activityGuidelines: '/activities/:id/guidelines',
  groupDetail: '/groups/:groupId',
  userDashboard: '/user-dashboard',
  buddy: '/buddy',
  admin: '/admin',
  forbidden: '/403',
  notFound: '*',
}

// Kết quả SePay chuyển về: /payment/success | /payment/error | /payment/cancel (?paymentId=...)
export const PAYMENT_RESULTS = {
  success: 'success',
  error: 'error',
  cancel: 'cancel',
}

export const buildPaymentResultPath = (result) => ROUTES.paymentResult.replace(':result', result)

export const buildActivityDetailPath = (id) => `${ROUTES.activities}/${id}`

/** /activities?q=...&type=... (bỏ qua giá trị rỗng / 'ALL') */
export const buildActivitiesSearchPath = ({ keyword = '', type = 'ALL' } = {}) => {
  const params = new URLSearchParams()

  if (keyword.trim()) params.set('q', keyword.trim())
  if (type && type !== 'ALL') params.set('type', type)

  const query = params.toString()

  return query ? `${ROUTES.activities}?${query}` : ROUTES.activities
}

export const buildActivityGuidelinesPath = (id) =>
  `${ROUTES.activities}/${id}/guidelines`

export const buildGroupDetailPath = (groupId) =>
  ROUTES.groupDetail.replace(':groupId', groupId)

export const getDefaultRouteByRole = (role) => {
  const normalizedRole = normalizeRole(role)

  if (normalizedRole === USER_ROLES.admin) return ROUTES.admin
  if (normalizedRole === USER_ROLES.buddy) return ROUTES.buddy

  return ROUTES.home
}

/**
 * Tính toán đường dẫn chuyển hướng sau khi đăng nhập an toàn:
 * Tránh việc user thường bị redirect vào /admin hoặc Admin bị redirect vào /user-dashboard
 * gây ra lỗi 403 Forbidden.
 */
export const getTargetRouteAfterLogin = (role, fromPath) => {
  const defaultPath = getDefaultRouteByRole(role)
  if (
    !fromPath ||
    fromPath === ROUTES.home ||
    fromPath === ROUTES.forbidden ||
    fromPath === ROUTES.login ||
    fromPath === ROUTES.register
  ) {
    return defaultPath
  }

  const normalizedRole = normalizeRole(role)

  // Không cho role không phải ADMIN vào /admin
  if (fromPath.startsWith(ROUTES.admin) && normalizedRole !== USER_ROLES.admin) {
    return defaultPath
  }

  // Không cho role không phải BUDDY vào /buddy
  if (fromPath.startsWith(ROUTES.buddy) && normalizedRole !== USER_ROLES.buddy) {
    return defaultPath
  }

  // Admin hoặc Buddy không bị ép vào các trang dành riêng cho USER
  if (
    (normalizedRole === USER_ROLES.admin || normalizedRole === USER_ROLES.buddy) &&
    (fromPath.startsWith(ROUTES.userDashboard) || fromPath.startsWith('/payment/'))
  ) {
    return defaultPath
  }

  return fromPath
}
