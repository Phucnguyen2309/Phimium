import { useLanguage } from '@/context/languageContext.js'
import { formatDateTime } from '@/utils/format.js'

import { CalendarIcon, LocationIcon, ShieldIcon, UsersIcon } from './ActivityDetailIcons.jsx'
import { InfoBox } from './InfoBox.jsx'

export function ActivityIncludedSection({ activity }) {
  const { t } = useLanguage()

  return (
    <section className="mt-8">
      <h2 className="text-xl font-black text-slate-950">
        {t('activityDetail.included.title')}
      </h2>

      <div className="mt-4 grid gap-4 rounded-2xl bg-blue-50/70 p-4 sm:grid-cols-2">
        <InfoBox
          icon={<UsersIcon />}
          title={t('activityDetail.included.smallGroup')}
          text={t('activityDetail.included.maxParticipants', {
            count: activity?.maximumParticipants ?? 0,
          })}
        />

        <InfoBox
          icon={<CalendarIcon />}
          title={t('activityDetail.included.scheduled')}
          text={formatDateTime(activity?.startTime)}
        />

        <InfoBox
          icon={<ShieldIcon />}
          title={t('activityDetail.included.safety')}
          text={t('activityDetail.included.safetyText')}
        />

        <InfoBox
          icon={<LocationIcon />}
          title={t('activityDetail.included.location')}
          text={activity?.locationName || t('activityDetail.included.locationPending')}
        />
      </div>
    </section>
  )
}