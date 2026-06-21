import { hasValidCoordinates } from '../activityDetailUtils.js'
import { LocationIcon } from './ActivityDetailIcons.jsx'

export function ActivityLocationSection({ activity }) {
  return (
    <section className="mt-8">
      <h2 className="text-xl font-black text-slate-950">
        Where we&apos;ll be
      </h2>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <LocationIcon />
          </div>

          <div>
            <p className="font-black text-slate-950">
              {activity?.locationName || 'Chưa cập nhật địa điểm'}
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-600">
              {activity?.address || 'Chưa cập nhật địa chỉ'}
            </p>

            {hasValidCoordinates(activity) && (
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Lat: {activity.latitude}, Lng: {activity.longitude}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}