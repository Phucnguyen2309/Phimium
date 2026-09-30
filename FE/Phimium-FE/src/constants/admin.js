export const ADMIN_TABS = {
  overview: 'OVERVIEW',
  activities: 'ACTIVITIES',
  bookings: 'BOOKINGS',
  buddies: 'BUDDIES',
  users: 'USERS',
  coupons: 'COUPONS',
  payments: 'PAYMENTS',
  feedbacks: 'FEEDBACKS',
}

export const ADMIN_TAB_ITEMS = [
  { id: ADMIN_TABS.overview, labelKey: 'admin.tabs.overview', icon: 'chart' },
  { id: ADMIN_TABS.activities, labelKey: 'admin.tabs.activities', icon: 'compass' },
  { id: ADMIN_TABS.bookings, labelKey: 'admin.tabs.bookings', icon: 'ticket' },
  { id: ADMIN_TABS.buddies, labelKey: 'admin.tabs.buddies', icon: 'badgeCheck' },
  { id: ADMIN_TABS.users, labelKey: 'admin.tabs.users', icon: 'users' },
  { id: ADMIN_TABS.coupons, labelKey: 'admin.tabs.coupons', icon: 'tag' },
  { id: ADMIN_TABS.payments, labelKey: 'admin.tabs.payments', icon: 'creditCard' },
  { id: ADMIN_TABS.feedbacks, labelKey: 'admin.tabs.feedbacks', icon: 'star' },
]

export const BADGE_STYLES = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
}