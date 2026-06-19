export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  activities: '/activities',
  activityDetail: '/activities/:id',
  activityGuidelines: '/activities/:id/guidelines',
  myActivities: '/my-activities',
  buddy: '/buddy',
  admin: '/admin',
  forbidden: '/403',
}

export const buildActivityDetailPath = (id) => `${ROUTES.activities}/${id}`

export const buildActivityGuidelinesPath = (id) =>
  `${ROUTES.activities}/${id}/guidelines`

export const getDefaultRouteByRole = (role) => {
  const normalizedRole = String(role ?? '').replace('ROLE_', '').toUpperCase()

  if (normalizedRole === 'ADMIN') return ROUTES.admin
  if (normalizedRole === 'BUDDY') return ROUTES.buddy

  return ROUTES.home
}
