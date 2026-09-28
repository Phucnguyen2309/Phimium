import { Link } from 'react-router-dom'

import { useLanguage } from '@/context/languageContext.js'
import { buildActivityGuidelinesPath, ROUTES } from '@/routes/paths.js'

export function ActivityQuickLinks({ id }) {
  const { t } = useLanguage()

  return (
    <div className="mt-8 flex flex-wrap gap-4 text-sm font-bold">
      <Link
        to={buildActivityGuidelinesPath(id)}
        className="text-blue-700 transition hover:text-blue-600"
      >
        {t('activityDetail.viewGuidelines')}
      </Link>

      <Link
        to={ROUTES.userDashboard}
        className="text-slate-700 transition hover:text-slate-950"
      >
        {t('activityDetail.myActivities')}
      </Link>

      <Link
        to={ROUTES.activities}
        className="text-slate-700 transition hover:text-slate-950"
      >
        {t('activityDetail.moreActivities')}
      </Link>
    </div>
  )
}