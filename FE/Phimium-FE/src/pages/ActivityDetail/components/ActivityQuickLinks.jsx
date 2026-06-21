import { Link } from 'react-router-dom'

import { buildActivityGuidelinesPath, ROUTES } from '@/routes/paths.js'

export function ActivityQuickLinks({ id }) {
  return (
    <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold">
      <Link
        to={buildActivityGuidelinesPath(id)}
        className="text-blue-700 transition hover:text-blue-600"
      >
        Xem hướng dẫn an toàn
      </Link>

      <Link
        to={ROUTES.userDashboard ?? ROUTES.home}
        className="text-slate-700 transition hover:text-slate-950"
      >
        Hoạt động của tôi
      </Link>

      <Link
        to={ROUTES.home}
        className="text-slate-700 transition hover:text-slate-950"
      >
        Quay lại
      </Link>
    </div>
  )
}