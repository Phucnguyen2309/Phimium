import { useLocation } from 'react-router-dom'

import { SiteHeader } from '@/components/layout/SiteHeader.jsx'
import { ROUTES } from '@/routes/paths.js'

export function MainLayout({ children }) {
  const location = useLocation()

  // Trang Buddy dashboard và Admin có header riêng nên ẩn header chung
  const isBuddyDashboard = location.pathname.startsWith(ROUTES.buddy)
  const isAdminDashboard = location.pathname.startsWith(ROUTES.admin)

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50/40 text-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute right-0 top-40 h-96 w-96 rounded-full bg-slate-200/50 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-yellow-200/25 blur-3xl" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(rgba(15, 23, 42, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10">
        {!isBuddyDashboard && !isAdminDashboard && <SiteHeader />}

        <main className={`relative z-0 ${isBuddyDashboard || isAdminDashboard ? '' : 'pt-16'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
