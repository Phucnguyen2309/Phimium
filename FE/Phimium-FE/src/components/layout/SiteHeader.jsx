import { useCallback, useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

import { LanguageSwitcher } from '@/components/common'
import { BrandLogo } from '@/components/layout/BrandLogo.jsx'
import { USER_ROLES } from '@/constants/app.js'
import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { useClickOutside } from '@/hooks/useClickOutside.js'
import { ROUTES } from '@/routes/paths.js'
import { normalizeRole } from '@/utils/role.js'

const EXPLORE_ITEMS = [
  { labelKey: 'nav.allActivities', to: ROUTES.activities },
  { labelKey: 'nav.featuredActivities', to: `${ROUTES.home}#popular-activities` },
]

const navLinkClass = (isActive) =>
  `relative py-2 text-sm font-semibold transition ${
    isActive
      ? 'text-blue-950 after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-yellow-400'
      : 'text-slate-500 hover:text-blue-950'
  }`

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  )
}

const ICONS = {
  chevron: 'M6 9l6 6 6-6',
  chat: 'M7 8h10M7 12h6m-9 8l2.5-3H19a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h1',
  bell: 'M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 10-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
}

const menuItemClass =
  'block w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-blue-950'

function ExploreDropdown({ onNavigate }) {
  const { t } = useLanguage()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useClickOutside(close)

  const isActive = location.pathname.startsWith(ROUTES.activities)

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`${navLinkClass(isActive)} inline-flex items-center gap-1`}
      >
        {t('nav.explore')}
        <Icon
          path={ICONS.chevron}
          className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {EXPLORE_ITEMS.map((item) => (
            <Link
              key={item.labelKey}
              to={item.to}
              onClick={() => {
                close()
                onNavigate?.()
              }}
              className={menuItemClass}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AccountMenu() {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const ref = useClickOutside(close)

  const userRole = normalizeRole(user?.role)
  const displayName = (user?.username || t('nav.myAccount')).split('@')[0].trim()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={t('nav.accountMenu')}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
          user
            ? 'border-blue-950 bg-blue-950 text-xs font-black text-white'
            : 'border-slate-300 text-slate-600 hover:border-blue-950 hover:text-blue-950'
        }`}
      >
        {user ? displayName.charAt(0).toUpperCase() : <Icon path={ICONS.user} />}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl">
          {user ? (
            <>
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {t('nav.signedInAs')}
                </p>
                <p className="mt-1 truncate text-sm font-bold text-blue-950">
                  {displayName}
                </p>
              </div>

              <Link to={ROUTES.userDashboard} onClick={close} className={menuItemClass}>
                {t('nav.userDashboard')}
              </Link>

              {userRole === USER_ROLES.buddy && (
                <Link to={ROUTES.buddy} onClick={close} className={menuItemClass}>
                  {t('nav.buddyPage')}
                </Link>
              )}

              {userRole === USER_ROLES.admin && (
                <Link to={ROUTES.admin} onClick={close} className={menuItemClass}>
                  {t('nav.adminPage')}
                </Link>
              )}

              <button
                type="button"
                onClick={() => {
                  close()
                  logout()
                }}
                className={`${menuItemClass} border-t border-slate-100 text-red-600 hover:text-red-700`}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.login} onClick={close} className={menuItemClass}>
                {t('nav.login')}
              </Link>
              <Link to={ROUTES.register} onClick={close} className={menuItemClass}>
                {t('nav.becomeBuddy')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function SiteHeader() {
  const { t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const closeMobile = useCallback(() => setMobileOpen(false), [])

  // Đổ bóng nhẹ cho header khi đã cuộn xuống
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8)

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = (
    <>
      <NavLink
        to={ROUTES.home}
        end
        onClick={closeMobile}
        className={({ isActive }) => navLinkClass(isActive)}
      >
        {t('nav.home')}
      </NavLink>

      <NavLink
        to={ROUTES.userDashboard}
        onClick={closeMobile}
        className={({ isActive }) => navLinkClass(isActive)}
      >
        {t('nav.bookings')}
      </NavLink>

      <ExploreDropdown onNavigate={closeMobile} />
    </>
  )

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[999] border-b backdrop-blur-xl transition duration-300 ${
        scrolled
          ? 'border-slate-200/80 bg-white/90 shadow-[0_8px_30px_-12px_rgba(22,36,86,0.18)]'
          : 'border-transparent bg-white'
      }`}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1920px] items-center justify-between gap-6 px-4 sm:px-6 lg:px-10 2xl:px-16">
        <BrandLogo />

        <nav className="hidden items-center gap-8 md:flex">{navLinks}</nav>

        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher variant="plain" />

          <span className="hidden h-5 w-px bg-slate-200 sm:block" />

          <button
            type="button"
            aria-label={t('nav.messages')}
            className="hidden text-slate-500 transition hover:text-blue-950 sm:inline-flex"
          >
            <Icon path={ICONS.chat} />
          </button>

          <button
            type="button"
            aria-label={t('nav.notifications')}
            className="hidden text-slate-500 transition hover:text-blue-950 sm:inline-flex"
          >
            <Icon path={ICONS.bell} />
          </button>

          <AccountMenu />

          <button
            type="button"
            aria-label={t('nav.openMenu')}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex text-slate-600 md:hidden"
          >
            <Icon path={ICONS.menu} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="flex flex-col items-start gap-2 border-t border-slate-100 bg-white px-4 py-3 md:hidden">
          {navLinks}
        </nav>
      )}
    </header>
  )
}
