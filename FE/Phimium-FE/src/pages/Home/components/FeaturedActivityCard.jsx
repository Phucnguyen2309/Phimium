import { useState } from 'react'
import { Link } from 'react-router-dom'

import logo from '@/assets/images/logo.png'
import { useLanguage } from '@/context/languageContext.js'
import {
  formatActivityType,
  formatPrice,
  getValidImage,
} from '@/features/activity/activityMapper.js'
import { buildActivityDetailPath } from '@/routes/paths.js'
import { formatTimeRange } from '@/utils/format.js'
import { Icon } from '@/components/common'

function MetaItem({ icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon name={icon} className="h-3.5 w-3.5 text-blue-700" />
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
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const imageUrl = imageFailed ? '' : getValidImage(activity.thumbnailUrl)
  const detailPath = buildActivityDetailPath(activity.id)
  const highlights = [
    activity.hostBuddyName &&
      t('activities.ledBy', { name: activity.hostBuddyName }),
    activity.address,
    t('home.featured.safetyNote'),
  ].filter(Boolean)

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-500 ease-out focus-within:ring-4 focus-within:ring-blue-900/15 hover:-translate-y-1.5 hover:shadow-[0_32px_64px_-32px_rgba(22,36,86,0.45)]">
      <div className="shine relative h-60 overflow-hidden bg-blue-950">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageFailed(true)}
            className={`h-full w-full object-cover transition duration-[1200ms] ease-out group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800">
            <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/95 shadow-xl">
              <img src={logo} alt="" aria-hidden="true" className="h-14 w-14 object-contain" />
            </span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent" />

        <span className="absolute left-5 top-5 rounded-full bg-white/95 transition duration-500 group-hover:translate-x-1 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-950 shadow-sm backdrop-blur">
          {formatActivityType(activity.activityType)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs font-medium text-slate-500">
          <MetaItem icon="clock">
            {formatTimeRange(activity.startTime, activity.endTime)}
          </MetaItem>
          <MetaItem icon="user-group">{getGroupSizeText(activity, t)}</MetaItem>
          {activity.locationName && <MetaItem icon="map-pin">{activity.locationName}</MetaItem>}
        </div>

        <h3 className="mt-4 font-display text-2xl font-bold leading-snug text-blue-950">
          <Link
            to={detailPath}
            state={{ activity }}
            className="outline-none after:absolute after:inset-0 after:content-['']"
          >
            {activity.title}
          </Link>
        </h3>

        {activity.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-7 text-slate-600">
            {activity.description}
          </p>
        )}

        <ul className="mb-6 mt-5 space-y-2 text-xs text-slate-600">
          {highlights.map((item) => (
            <li key={item} className="flex items-start gap-2.5">
              <span className="mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                <Icon name="check" className="h-2.5 w-2.5" strokeWidth={3} />
              </span>
              <span className="line-clamp-1">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-6">
          <div>
            <p className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {t('home.featured.pricePerPerson')}
            </p>
            <p className="mt-1 whitespace-nowrap font-display text-xl font-bold text-blue-950 sm:text-[1.7rem]">
              {formatPrice(activity.participationFee)}
            </p>
          </div>

          <span className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-blue-950 transition duration-300 group-hover:bg-yellow-300 group-hover:shadow-[0_10px_24px_-10px_rgba(253,199,0,0.9)]">
            {t('common.viewDetails')}
            <Icon
              name="arrow-right"
              className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </span>
        </div>
      </div>
    </article>
  )
}
