import { useMemo } from 'react'

import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { PointsMap } from '@/features/map/PointsMap.jsx'
import { buildDirectionsUrl, hasValidCoordinates } from '@/utils/geo.js'

export function MeetingPointSection({ activity }) {
  const { t } = useLanguage()

  const point = useMemo(
    () => ({
      id: activity.id,
      name: activity.locationName || activity.address,
      address: activity.address,
      latitude: activity.latitude,
      longitude: activity.longitude,
    }),
    [activity],
  )

  if (!point.name) return null

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-800">
            {t('activityDetail.meeting.eyebrow')}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-blue-950">{t('activityDetail.meeting.title')}</h2>
        </div>
        <a
          href={buildDirectionsUrl(point)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-blue-900 transition hover:text-blue-700"
        >
          {t('activityDetail.meeting.openMaps')}
          <Icon name="arrow-right" className="h-3.5 w-3.5 -rotate-45" strokeWidth={2} />
        </a>
      </div>

      <p className="mt-3 text-[15px] leading-7 text-slate-600">{t('activityDetail.meeting.text')}</p>

      {hasValidCoordinates(point) && (
        <PointsMap
          points={[point]}
          activeId={point.id}
          className="mt-5 h-72 rounded-2xl ring-1 ring-slate-200 sm:h-80"
        />
      )}

      <div className="mt-4 flex items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-950 text-yellow-400">
          <Icon name="map-pin" className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold text-blue-950">{point.name}</span>
          {point.address && point.address !== point.name && (
            <span className="block text-sm text-slate-500">{point.address}</span>
          )}
        </span>
      </div>
    </section>
  )
}
