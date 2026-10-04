import { useLanguage } from '@/context/languageContext.js'

export function BuddySidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  onLogout,
  scheduleCount = 0,
  feedbackCount = 0,
  user,
  isAvailable = true,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const navItems = [
    {
      id: 'SCHEDULES',
      label: isVi ? 'Lịch dẫn tour' : 'Tour Schedules',
      badge: scheduleCount,
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
          />
        </svg>
      ),
    },
    {
      id: 'REVIEWS',
      label: isVi ? 'Đánh giá từ khách' : 'Guest Reviews',
      badge: feedbackCount,
      icon: (
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ),
    },
  ]

  const displayName = user?.fullName?.trim() || 'Buddy'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden animate-fade-in"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-0 bottom-0 h-screen shrink-0 flex flex-col justify-between border-r border-slate-800/80 bg-[#121626] text-white transition-all duration-300 ease-in-out z-50 md:z-40 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'w-64 md:w-64'}`}
      >
      {/* Brand Header & Navigation Menu */}
      <div
        className={`flex flex-1 min-h-0 flex-col overflow-y-auto ${
          isCollapsed ? 'px-2 py-4' : 'p-5'
        }`}
      >
        {/* Brand & Collapse Button */}
        <div
          className={`mb-6 flex shrink-0 items-center ${
            isCollapsed ? 'flex-col justify-center gap-3' : 'justify-between px-1 pt-1'
          }`}
        >
          {isCollapsed ? (
            <>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="group flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 p-1.5 ring-1 ring-white/20 transition hover:bg-white/20 hover:scale-105 active:scale-95"
                title={isVi ? 'Mở rộng menu' : 'Expand sidebar'}
              >
                <img
                  src="/logo.png"
                  alt="Phimium"
                  className="h-8 w-8 object-contain drop-shadow-sm"
                />
              </button>
              <button
                type="button"
                onClick={onToggleCollapse}
                className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:text-white"
                title={isVi ? 'Mở rộng menu' : 'Expand sidebar'}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 p-1 ring-1 ring-white/20 shadow-sm">
                  <img
                    src="/logo.png"
                    alt="Phimium"
                    className="h-7 w-7 object-contain drop-shadow-sm"
                  />
                </span>
                <div className="flex flex-col leading-none">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-wide text-white">PHIMIUM</span>
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold text-indigo-300 ring-1 ring-indigo-500/30">
                      BUDDY
                    </span>
                  </div>
                  <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {isVi ? 'Khu vực điều hành' : 'Workspace'}
                  </span>
                </div>
              </div>

              {/* Desktop Collapse Toggle */}
              <button
                type="button"
                onClick={onToggleCollapse}
                className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                title={isVi ? 'Thu gọn menu' : 'Collapse sidebar'}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>

              {/* Mobile Close Drawer */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white"
                title={isVi ? 'Đóng menu' : 'Close menu'}
              >
                ✕
              </button>
            </>
          )}
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id)
                  onCloseMobile?.()
                }}
                title={item.label}
                className={`relative flex items-center rounded-xl text-xs font-semibold transition-all ${
                  isCollapsed
                    ? 'mx-auto h-11 w-11 justify-center'
                    : 'w-full justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-[#212946] text-white shadow-sm ring-1 ring-white/10'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && typeof item.badge === 'number' && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {isCollapsed && isActive && (
                  <span className="absolute left-1 h-5 w-1 rounded-r-full bg-indigo-500" />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Footer: User profile & Logout */}
      <div
        className={`shrink-0 border-t border-slate-800/80 bg-[#121626] ${
          isCollapsed ? 'p-3' : 'p-4'
        }`}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/30 text-indigo-200 font-bold text-sm ring-1 ring-indigo-500/30"
              title={displayName}
            >
              {initial}
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
              title={isVi ? 'Đăng xuất' : 'Sign out'}
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
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
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600/30 font-bold text-sm text-indigo-200 ring-1 ring-indigo-500/30">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-200">
                  {displayName}
                </p>
                <p
                  className={`truncate text-[10px] font-medium ${
                    isAvailable ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {isAvailable
                    ? isVi
                      ? '● Sẵn sàng nhận tour'
                      : '● Available for tours'
                    : isVi
                      ? '○ Đang tạm nghỉ'
                      : '○ On a break'}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2">
              <button
                type="button"
                onClick={onLogout}
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
    </>
  )
}
