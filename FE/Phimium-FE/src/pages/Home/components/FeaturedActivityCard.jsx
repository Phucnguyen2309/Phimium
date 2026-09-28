import { Link } from 'react-router-dom'

import {
  formatActivityType,
  formatPrice,
  getValidImage,
} from '@/features/activity/activityMapper.js'
import { useLanguage } from '@/context/languageContext.js'
import { buildActivityDetailPath } from '@/routes/paths.js'
import { formatTimeRange } from '@/utils/format.js'

function MetaItem({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden="true">{icon}</span>
      {children}
    </span>
  )
}

const getGroupSizeText = (activity, t) => {
  const { groupMinSize, groupMaxSize } = activity

  if (groupMinSize && groupMaxSize) {
    return t('home.featured.groupRange', { min: groupMinSize, max: groupMaxSize })
  }

  if (groupMaxSize) return t('home.featured.groupMax', { max: groupMaxSize })

  return t('home.featured.smallGroup')
}

export function FeaturedActivityCard({ activity }) {
  const { t } = useLanguage()
  const imageUrl = getValidImage(activity.thumbnailUrl)
  const detailPath = buildActivityDetailPath(activity.id)
  const highlights = [
    activity.hostBuddyName &&
      t('activities.ledBy', { name: activity.hostBuddyName }),
    activity.address,
    t('home.featured.safetyNote'),
  ].filter(Boolean)

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link
        to={detailPath}
        state={{ activity }}
        className="relative block h-56 overflow-hidden bg-blue-100"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.title}
            className="h-full w-full object-cover transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-2xl font-black text-blue-950">
              P
            </span>
          </div>
        )}

        <span className="absolute left-4 top-4 rounded-md bg-yellow-400 px-2.5 py-1 text-[11px] font-black text-blue-950 shadow-sm">
          {formatActivityType(activity.activityType)}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-slate-500">
          <MetaItem icon="🕒">
            {formatTimeRange(activity.startTime, activity.endTime)}
          </MetaItem>
          <MetaItem icon="👥">{getGroupSizeText(activity, t)}</MetaItem>
          {activity.locationName && (
            <MetaItem icon="📍">{activity.locationName}</MetaItem>
          )}
        </div>

        <h3 className="mt-3 text-xl font-black leading-snug text-blue-950">
          <Link to={detailPath} state={{ activity }} className="hover:text-blue-700">
            {activity.title}
          </Link>
        </h3>

        {activity.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
            {activity.description}
          </p>
        )}

        <ul className="mt-4 space-y-1.5 text-xs text-slate-600">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-700" aria-hidden="true">
                ✓
              </span>
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {t('home.featured.pricePerPerson')}
            </p>
            <p className="text-xl font-black text-blue-950 sm:text-2xl">
              {formatPrice(activity.participationFee)}
            </p>
          </div>

          <Link
            to={detailPath}
            state={{ activity }}
            className="shrink-0 whitespace-nowrap rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-black text-blue-950 transition hover:bg-yellow-300"
          >
            {t('common.viewDetails')} →
          </Link>
        </div>
      </div>
    </article>
  )
}
