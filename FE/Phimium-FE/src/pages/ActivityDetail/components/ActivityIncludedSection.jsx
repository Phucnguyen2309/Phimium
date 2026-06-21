import { formatDateTime } from '../activityDetailData.js'
import { CalendarIcon, LocationIcon, ShieldIcon, UsersIcon } from './ActivityDetailIcons.jsx'
import { InfoBox } from './InfoBox.jsx'

export function ActivityIncludedSection({ activity }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black text-slate-950">
        What&apos;s included
      </h2>

      <div className="mt-4 grid gap-4 rounded-2xl bg-blue-50/70 p-4 sm:grid-cols-2">
        <InfoBox
          icon={<UsersIcon />}
          title="Small group"
          text={`Tối đa ${activity?.maximumParticipants ?? 0} người tham gia.`}
        />

        <InfoBox
          icon={<CalendarIcon />}
          title="Scheduled activity"
          text={formatDateTime(activity?.startTime)}
        />

        <InfoBox
          icon={<ShieldIcon />}
          title="Safety terms"
          text="Người tham gia cần đồng ý điều khoản an toàn trước khi join."
        />

        <InfoBox
          icon={<LocationIcon />}
          title="Offline location"
          text={activity?.locationName || 'Địa điểm sẽ được cập nhật.'}
        />
      </div>
    </section>
  )
}