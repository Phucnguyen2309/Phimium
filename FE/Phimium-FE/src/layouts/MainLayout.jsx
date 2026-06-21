import { APP_NAME } from '@/constants/app.js'
import { useAuth } from '@/context/authContext.js'
import { ROUTES } from '@/routes/paths.js'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { label: 'Trang chủ', to: ROUTES.home },
  { label: 'Hoạt động', to: ROUTES.activities },
]

export function MainLayout({ children }) {
  const { user, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const displayName = (user?.username || 'Tài khoản của tôi').split('@')[0].trim()
  const userInitial = (displayName?.[0] || 'U').toUpperCase()
  const userRole = String(user?.role ?? '').replace('ROLE_', '').toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-teal-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-lime-100/70 blur-3xl" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(rgba(16,185,129,0.22) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10">
        <div className="fixed inset-x-0 top-0 z-[999] px-6 py-6 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1760px]">
            <header className="relative z-[100] grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-6 rounded-[26px] border border-emerald-100 bg-white/90 px-9 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur">
              <Link
                to={ROUTES.home}
                className="justify-self-start text-2xl font-black tracking-tight text-emerald-700"
              >
                {APP_NAME}
              </Link>

              <nav className="hidden items-center gap-12 justify-self-center text-sm font-semibold md:flex">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === ROUTES.home}
                    className={({ isActive }) =>
                      `pb-1 transition ${
                        isActive
                          ? 'border-b-2 border-emerald-600 text-emerald-700'
                          : 'text-slate-500 hover:text-emerald-700'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="flex items-center justify-end gap-3 justify-self-end">
                {!user && (
                  <Link
                    to={ROUTES.register}
                    className="hidden text-sm font-semibold text-emerald-700 transition hover:text-emerald-800 lg:inline-flex"
                  >
                    Trở thành Buddy
                  </Link>
                )}

                {user ? (
                  <div ref={menuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setMenuOpen((current) => !current)}
                      className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-600 px-2 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-emerald-700">
                        {userInitial}
                      </span>

                      <span className="max-w-28 truncate sm:max-w-40">
                        {displayName}
                      </span>
                    </button>

                    {menuOpen && (
                      <div className="absolute right-0 top-full z-[9999] mt-3 w-56 overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                        <div className="border-b border-slate-100 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Đang đăng nhập với
                          </p>

                          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                            {displayName}
                          </p>
                        </div>

                        <Link
                          to={ROUTES.userDashboard}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4 text-slate-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 22a8 8 0 1116 0"
                            />
                          </svg>
                          Bảng điều khiển
                        </Link>

                        {userRole === 'BUDDY' && (
                          <Link
                            to={ROUTES.buddy}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <svg
                              aria-hidden="true"
                              className="h-4 w-4 text-slate-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                              />
                            </svg>
                            Trang Buddy
                          </Link>
                        )}

                        {userRole === 'ADMIN' && (
                          <Link
                            to={ROUTES.admin}
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <svg
                              aria-hidden="true"
                              className="h-4 w-4 text-slate-400"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 7h16M4 12h16M4 17h16"
                              />
                            </svg>
                            Trang Admin
                          </Link>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false)
                            logout()
                          }}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          <svg
                            aria-hidden="true"
                            className="h-4 w-4 text-slate-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                            />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={ROUTES.login}
                    className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                  >
                    Đăng nhập
                  </Link>
                )}

                <button
                  className="hidden h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white/80 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>

                <button
                  className="hidden h-11 w-11 items-center justify-center rounded-full border border-emerald-100 bg-white/80 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-700 sm:inline-flex"
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 8h10M7 12h8m-8 4h6m-9 4l-2 2v-18a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H8z"
                    />
                  </svg>
                </button>
              </div>
            </header>
          </div>
        </div>

        <main className="relative z-0 pt-[128px]">{children}</main>
      </div>
    </div>
  )
}