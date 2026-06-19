import { APP_NAME } from '@/constants/app.js'
import { Container } from '@/components/common/Container.jsx'
import { AuthContext } from '@/context/AuthContext'
import { useContext, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

export function MainLayout({ children }) {
  const { user, logout } = useContext(AuthContext)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const displayName = (user?.username || 'My Account').split('@')[0].trim()
  const userInitial = (displayName?.[0] || 'U').toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div
      className="min-h-screen text-slate-950"
      style={{
        backgroundColor: '#111111',
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundPosition: '0 0, 12px 12px',
        backgroundSize: '24px 24px',
      }}
    >
      <Container className="py-4">
        <header className="flex h-16 items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
          <Link to="/" className="text-xl font-bold text-blue-700">
            {APP_NAME}
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            <a className="border-b-2 border-blue-600 pb-1 text-blue-700" href="#hero">
              Explore
            </a>
            <a className="transition hover:text-slate-900" href="#how-it-works">
              Workshops
            </a>
            <a className="transition hover:text-slate-900" href="#why-phimium">
              Cafes
            </a>
            <a className="transition hover:text-slate-900" href="#testimonials">
              Experiences
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/register" className="hidden text-sm font-semibold text-blue-700 lg:inline-flex">
              Become a Buddy
            </Link>
            {user ? (
              <div ref={menuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((current) => !current)}
                  className="flex items-center gap-2 rounded-full border border-blue-100 bg-blue-700 px-2 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-bold text-blue-700">
                    {userInitial}
                  </span>
                  {displayName}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.18)]">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Signed in as</p>
                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">{displayName}</p>
                    </div>
                    <Link
                      to="/my-activities"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <svg aria-hidden="true" className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12a5 5 0 100-10 5 5 0 000 10zM4 22a8 8 0 1116 0" />
                      </svg>
                      My Activities
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false)
                        logout()
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      <svg aria-hidden="true" className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
                Log In
              </Link>
            )}
            <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 sm:inline-flex" type="button">
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="hidden h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 sm:inline-flex" type="button">
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h8m-8 4h6m-9 4l-2 2v-18a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2H8z" />
              </svg>
            </button>
          </div>
        </header>
      </Container>

      <main>{children}</main>
    </div>
  )
}
