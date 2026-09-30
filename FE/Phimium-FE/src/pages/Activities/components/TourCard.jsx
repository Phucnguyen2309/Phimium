import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import {
  formatActivityType,
  formatDuration,
  formatPrice,
  getDurationMinutes,
  getValidImage,
} from '@/features/activity/activityMapper.js'
import { getMaxGroupSize } from '@/pages/Activities/toursFilter.js'
import { buildActivityDetailPath } from '@/routes/paths.js'
import { buildGoogleMapsUrl } from '@/utils/geo.js'
import { getInitials } from '@/utils/text.js'

function TourImage({ activity, maxGroupSize, duration }) {
  const { t } = useLanguage()
  const [hasError, setHasError] = useState(false)
  const imageUrl = getValidImage(activity.thumbnailUrl)

  return (
    <Link
      to={buildActivityDetailPath(activity.id)}
      state={{ activity }}
      className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-blue-950"
    >
      {imageUrl && !hasError ? (
        <img
          src={imageUrl}
          alt={activity.title}
          loading="lazy"
          onError={() => setHasError(true)}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-blue-800 font-display text-5xl font-bold text-yellow-400/90">
          {getInitials(activity.title, 'P')}
        </span>
      )}

      <span className="absolute inset-0 bg-gradient-to-t from-blue-950/50 via-transparent to-transparent" />

      <span className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        <span className="rounded-md bg-white/95 px-2 py-1 text-[11px] font-bold text-blue-950 shadow-sm">
          {formatActivityType(activity.activityType)}
        </span>
        {maxGroupSize > 0 && (
          <span className="rounded-md bg-emerald-400/95 px-2 py-1 text-[11px] font-bold text-emerald-950 shadow-sm">
            {t('activities.card.maxGuests', { count: maxGroupSize })}
          </span>
        )}
      </span>

      {duration && (
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-blue-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
          <Icon name="clock" className="h-3.5 w-3.5" strokeWidth={2} />
          {duration}
        </span>
      )}
    </Link>
  )
}

function Fact({ icon, children }) {
  return (
    <li className="flex items-center gap-2 text-xs text-slate-600">
      <Icon name={icon} className="h-4 w-4 shrink-0 text-blue-900" />
      <span className="min-w-0">{children}</span>
    </li>
  )
}

export function TourCard({ activity }) {
  const { t } = useLanguage()

  const maxGroupSize = getMaxGroupSize(activity)
  const minGroupSize = Number(activity.groupMinSize) || 0
  const duration = formatDuration(getDurationMinutes(activity))
  const childFee = Number(activity.childParticipationFee)
  const detailPath = buildActivityDetailPath(activity.id)
  const eyebrow = [activity.locationName, formatActivityType(activity.activityType)]
    .filter(Boolean)
    .join(' · ')

  return (
    <article className="group grid gap-6 rounded-[1.75rem] border border-slate-200/80 bg-white p-4 shadow-[0_24px_60px_-40px_rgba(22,36,86,0.45)] transition duration-500 hover:shadow-[0_30px_70px_-35px_rgba(22,36,86,0.5)] sm:p-5 lg:grid-cols-[21rem_1fr] lg:gap-8 2xl:grid-cols-[27rem_1fr] 2xl:gap-10">
      <div className="space-y-3">
        <TourImage activity={activity} maxGroupSize={maxGroupSize} duration={duration} />

        {(activity.locationName || activity.address) && (
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-950 text-yellow-400">
              <Icon name="map-pin" className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-blue-950">
                {activity.locationName || activity.address}
              </span>
              {activity.address && activity.address !== activity.locationName && (
                <span className="block truncate text-[11px] text-slate-500">{activity.address}</span>
              )}
            </span>
            <a
              href={buildGoogleMapsUrl(activity)}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 rounded-md bg-white px-2 py-1 text-[11px] font-bold text-blue-900 shadow-sm ring-1 ring-slate-200 transition hover:bg-yellow-400 hover:text-blue-950 hover:ring-yellow-400"
            >
              {t('activities.card.map')}
            </a>
          </div>
        )}

        <ul className="grid grid-cols-1 gap-2 px-1 sm:grid-cols-2">
          {maxGroupSize > 0 && (
            <Fact icon="user-group">
              {minGroupSize > 0 && minGroupSize < maxGroupSize
                ? t('activities.card.groupRange', { min: minGroupSize, max: maxGroupSize })
                : t('activities.card.maxGuests', { count: maxGroupSize })}
            </Fact>
          )}
          {childFee > 0 && (
            <Fact icon="banknotes">
              {t('activities.card.childPrice', { price: formatPrice(childFee) })}
            </Fact>
          )}
          {duration && <Fact icon="clock">{duration}</Fact>}
        </ul>
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {eyebrow && (
              <p className="truncate text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">
                {eyebrow}
              </p>
            )}
            <h2 className="mt-1.5 text-xl font-extrabold leading-snug tracking-tight text-blue-950 sm:text-2xl">
              <Link to={detailPath} state={{ activity }} className="transition hover:text-blue-700">
                {activity.title}
              </Link>
            </h2>
          </div>

          <div className="flex shrink-0 items-baseline gap-1.5 sm:block sm:text-right">
            <p className="text-[11px] font-medium text-slate-500">{t('activities.card.priceFrom')}</p>
            <p className="text-2xl font-extrabold tracking-tight text-blue-950">
              {formatPrice(activity.participationFee)}
            </p>
            <p className="text-[11px] text-slate-500">{t('activities.card.perGuest')}</p>
          </div>
        </div>

        {activity.description && (
          <p className="mt-3 line-clamp-4 text-[15px] leading-7 text-slate-600">
            {activity.description}
          </p>
        )}

        {maxGroupSize > 0 && (
          <div className="mb-6 mt-4 flex items-start gap-2.5 rounded-xl border border-emerald-100 bg-emerald-50/70 px-3.5 py-3 text-[13px] leading-5 text-slate-700">
            <Icon name="check-circle" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" strokeWidth={2} />
            <p>
              <span className="font-bold text-blue-950">{t('activities.card.smallGroupTitle')}</span>{' '}
              {t('activities.card.smallGroupText', { count: maxGroupSize })}
            </p>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Icon name="calendar" className="h-4 w-4 shrink-0 text-blue-900" />
            {t('activities.card.scheduleHint')}
          </p>

          <Link
            to={detailPath}
            state={{ activity }}
            className="shine group/btn inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-extrabold text-blue-950 shadow-[0_12px_28px_-12px_rgba(253,199,0,0.9)] transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 active:translate-y-0"
          >
            {t('activities.card.viewAndBook')}
            <Icon
              name="arrow-right"
              className="h-4 w-4 transition group-hover/btn:translate-x-1"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </article>
  )
}
