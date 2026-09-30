import { useState } from 'react'
import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { ADMIN_TABS } from '@/constants/admin.js'

const NAV_ITEMS = [
  {
    id: ADMIN_TABS.overview,
    defaultLabel: 'Dashboard',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    id: ADMIN_TABS.activities,
    defaultLabel: 'Tour & Hoạt động',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zm3.75-12.75l-2.25 6-6 2.25 2.25-6 6-2.25z" />
      </svg>
    ),
  },
  {
    id: ADMIN_TABS.bookings,
    defaultLabel: 'Đơn đặt chỗ',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
      </svg>
    ),
  },
  {
    id: ADMIN_TABS.buddies,
    defaultLabel: 'Hướng dẫn viên',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
  {
    id: ADMIN_TABS.users,
    defaultLabel: 'Người dùng',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    id: ADMIN_TABS.coupons,
    defaultLabel: 'Mã giảm giá',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386a9.07 9.07 0 003.54-3.54c.486-.827.313-1.908-.386-2.607l-9.581-9.581A2.25 2.25 0 009.568 3z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
      </svg>
    ),
  },
  {
    id: ADMIN_TABS.payments,
    defaultLabel: 'Giao dịch & HĐ',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-6-10.5h16.5a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H3.75A1.5 1.5 0 012.25 18V7.5a1.5 1.5 0 011.5-1.5z" />
      </svg>
    ),
  },
  {
    id: ADMIN_TABS.feedbacks,
    defaultLabel: 'Đánh giá & Góp ý',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
      </svg>
    ),
  },
]

export function AdminSidebar({
  activeTab,
  onSelectTab,
  isCollapsed: externalCollapsed,
  onToggleCollapse: externalToggleCollapse,
  onLogout,
}) {
  const { logout } = useAuth()
  const { t, language } = useLanguage()
  const [internalCollapsed, setInternalCollapsed] = useState(false)

  const isVi = language === 'vi'

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout()
    } else {
      logout()
    }
  }

  // Support both controlled and uncontrolled collapse
  const collapsed =
    typeof externalCollapsed === 'boolean'
      ? externalCollapsed
      : internalCollapsed
  const toggleCollapse =
    externalToggleCollapse || (() => setInternalCollapsed((prev) => !prev))

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 h-screen shrink-0 flex flex-col justify-between border-r border-slate-800/80 bg-[#121626] text-white transition-all duration-300 ease-in-out z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header & Menu */}
      <div className={`flex flex-1 min-h-0 flex-col overflow-y-auto custom-scrollbar-dark ${collapsed ? 'px-2 py-4' : 'p-5'}`}>
        {/* Logo & Collapse button */}
        <div
          className={`mb-6 flex shrink-0 items-center ${
            collapsed ? 'flex-col justify-center gap-3' : 'justify-between px-1 pt-1'
          }`}
        >
          {collapsed ? (
            <>
              {/* Collapsed Logo button -> expands sidebar */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="group flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 transition hover:bg-white/20 hover:scale-105 active:scale-95"
                title={isVi ? 'Mở rộng menu' : 'Expand sidebar'}
              >
                <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
                  <path
                    d="M10 26V7h8.2c4.3 0 7 2.4 7 6.1s-2.7 6.2-7 6.2H14.6"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="19" cy="13.1" r="2.3" fill="#facc15" />
                </svg>
              </button>
              {/* Expand arrow */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:text-white"
                title={isVi ? 'Mở rộng menu' : 'Expand sidebar'}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          ) : (
            <>
              {/* Expanded Brand: Logo + PHIMIUM */}
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20 shadow-sm">
                  <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
                    <path
                      d="M10 26V7h8.2c4.3 0 7 2.4 7 6.1s-2.7 6.2-7 6.2H14.6"
                      fill="none"
                      stroke="white"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="19" cy="13.1" r="2.3" fill="#facc15" />
                  </svg>
                </span>
                <div className="flex flex-col leading-none">
                  <span className="text-base font-black tracking-wide text-white">PHIMIUM</span>
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {isVi ? 'Sài Gòn Chọn Lọc' : 'Curated Saigon'}
                  </span>
                </div>
              </div>

              {/* Collapse button */}
              <button
                type="button"
                onClick={toggleCollapse}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                title={isVi ? 'Thu gọn menu' : 'Collapse sidebar'}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Navigation list: Dynamically translated based on language */}
        <nav className="flex flex-col gap-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            const itemKey = String(item.id).toLowerCase()
            const itemLabel = t('admin.tabs.' + itemKey) || t('admin.tabs.' + item.id) || item.defaultLabel

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                title={itemLabel}
                className={`relative flex items-center rounded-xl text-xs font-semibold transition-all ${
                  collapsed
                    ? 'mx-auto h-11 w-11 justify-center'
                    : 'w-full gap-3 px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#212946] text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <span className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{itemLabel}</span>}
                {collapsed && isActive && (
                  <span className="absolute left-1 h-5 w-1 rounded-r-full bg-indigo-500" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer: Clean Logo Avatar + Sign out (Fixed at bottom of viewport) */}
      <div className={`shrink-0 border-t border-slate-800/80 bg-[#121626] ${collapsed ? 'p-3' : 'p-4'}`}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20"
              title={isVi ? 'Quản trị viên (Trực tuyến)' : 'Administrator (Online)'}
            >
              <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M10 26V7h8.2c4.3 0 7 2.4 7 6.1s-2.7 6.2-7 6.2H14.6"
                  fill="none"
                  stroke="white"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="19" cy="13.1" r="2.3" fill="#facc15" />
              </svg>
            </div>
            <button
              type="button"
              onClick={handleLogoutClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
              title={isVi ? 'Đăng xuất' : 'Sign out'}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                />
              </svg>
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <svg viewBox="0 0 32 32" className="h-5 w-5" aria-hidden="true">
                  <path
                    d="M10 26V7h8.2c4.3 0 7 2.4 7 6.1s-2.7 6.2-7 6.2H14.6"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="19" cy="13.1" r="2.3" fill="#facc15" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-200">
                  Admin
                </p>
                <p className="truncate text-[10px] font-medium text-emerald-400">
                  {isVi ? '● Trực tuyến' : '● Online'}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2">
              <button
                type="button"
                onClick={handleLogoutClick}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-rose-300"
              >
                <span>{isVi ? 'Đăng xuất' : 'Sign out'}</span>
                <span className="text-slate-500">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}