export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  activities: '/activities',
  activityDetail: '/activities/:id',
  activityGuidelines: '/activities/:id/guidelines',
  // myActivities: '/my-activities',
  buddy: '/buddy',
  admin: '/admin',
  forbidden: '/403',
  myGroup : '/mygroup',
    groupDetail: '/groups/:groupId',
  userDashboard: '/user-dashboard'
}

export const buildActivityDetailPath = (id) => `${ROUTES.activities}/${id}`

export const buildGroupDetailPath = (groupId) => `/groups/${groupId}`

export const buildActivityGuidelinesPath = (id) =>
  `${ROUTES.activities}/${id}/guidelines`

export const getDefaultRouteByRole = (role) => {
  const normalizedRole = String(role ?? '').replace('ROLE_', '').toUpperCase()

  if (normalizedRole === 'ADMIN') return ROUTES.admin
  if (normalizedRole === 'BUDDY') return ROUTES.buddy

  return ROUTES.home
}
