import { USER_ROLES } from '@/constants/app.js'
import { normalizeRole } from '@/utils/role.js'

export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
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
