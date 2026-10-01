import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import {
  formatDuration,
  formatPrice,
  getDurationMinutes,
} from '@/features/activity/activityMapper.js'

import { DetailGallery } from './DetailGallery.jsx'

function Fact({ icon, label, value }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-900">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">{label}</span>
        <span className="block truncate text-sm font-bold text-blue-950">{value}</span>
      </span>
    </div>
  )
}

export function DetailHero({ activity, groupLimit, upcomingCount }) {
  const { t } = useLanguage()
  const duration = formatDuration(getDurationMinutes(activity))
  const childFee = Number(activity.childParticipationFee)

  const facts = [
    duration && { icon: 'clock', label: t('activityDetail.facts.duration'), value: duration },
    groupLimit > 0 && {
      icon: 'user-group',
      label: t('activityDetail.facts.groupSize'),
      value:
        activity.groupMinSize > 0 && activity.groupMinSize < groupLimit
          ? t('activities.card.groupRange', { min: activity.groupMinSize, max: groupLimit })
          : t('activities.card.maxGuests', { count: groupLimit }),
    },
    activity.locationName && { icon: 'map-pin', label: t('activityDetail.facts.startPoint'), value: activity.locationName },
    { icon: 'calendar', label: t('activityDetail.facts.departures'), value: upcomingCount > 0 ? t('activities.card.upcomingCount', { count: upcomingCount }) : t('activityDetail.facts.noDepartures') },
    childFee > 0 && { icon: 'banknotes', label: t('activityDetail.facts.childPrice'), value: formatPrice(childFee) },
  ].filter(Boolean)

  return (
    <section className="mt-6">
      <DetailGallery activity={activity} />

      {facts.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
          {facts.map((fact) => (
            <Fact key={fact.label} {...fact} />
          ))}
        </div>
      )}
    </section>
  )
}
