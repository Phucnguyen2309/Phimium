import { useLocation } from 'react-router-dom'

import { SiteHeader } from '@/components/layout/SiteHeader.jsx'
import { ROUTES } from '@/routes/paths.js'

export function MainLayout({ children }) {
  const location = useLocation()

  // Trang Buddy dashboard có header riêng nên ẩn header chung
  const isBuddyDashboard = location.pathname.startsWith(ROUTES.buddy)

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
        {!isBuddyDashboard && <SiteHeader />}

        <main className={`relative z-0 ${isBuddyDashboard ? '' : 'pt-16'}`}>
          {children}
        </main>
      </div>
    </div>
  )
}
