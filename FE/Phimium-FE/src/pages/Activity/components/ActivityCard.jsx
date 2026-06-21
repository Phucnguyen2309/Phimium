import { Link } from 'react-router-dom'

import { buildActivityDetailPath } from '@/routes/paths.js'

import {
  formatActivityType,
  formatDateTime,
  formatPrice,
  formatStatus,
  getRemainingSlots,
  getValidImage,
} from '../ActivityMapper.js'

function ImageFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-2xl font-black text-white">
        P
      </div>
    </div>
  )
}

export default function ActivityCard({ activity, viewMode = 'GRID' }) {
  const imageUrl = getValidImage(activity.thumbnailUrl)
  const remainingSlots = getRemainingSlots(activity)

  if (viewMode === 'LIST') {
    return (
      <Link
        to={buildActivityDetailPath(activity.id)}
        state={{ activity }}
        className="group grid overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl md:grid-cols-[260px_1fr]"
      >
        <div className="relative h-56 overflow-hidden md:h-full">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={activity.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <ImageFallback />
          )}

          <span className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
            {formatStatus(activity.status)}
          </span>
        </div>

        <div className="flex flex-col justify-between p-5">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                {formatActivityType(activity.activityType)}
              </span>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                {formatPrice(activity.participationFee)}
              </span>
            </div>

            <h3 className="mt-4 text-xl font-black text-slate-950">
              {activity.title}
            </h3>

            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
              {activity.description}
            </p>
          </div>

          <div className="mt-5 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <p> {formatDateTime(activity.startTime)}</p>
            <p> {activity.locationName || activity.address || 'TBA'}</p>
            <p> Hosted by {activity.hostBuddyName}</p>
            <p>{remainingSlots} slots left</p>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={buildActivityDetailPath(activity.id)}
      state={{ activity }}
      className="group overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-64 overflow-hidden bg-emerald-50">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={activity.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <ImageFallback />
        )}

        <div className="absolute left-4 top-4 rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
          {formatActivityType(activity.activityType)}
        </div>

        
      </div>

      <div className="p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
            {formatPrice(activity.participationFee)}
          </span>

          <span className="text-xs font-bold text-orange-600">
            {remainingSlots} left
          </span>
        </div>

        <h3 className="line-clamp-2 text-lg font-black leading-tight text-slate-950">
          {activity.title}
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          {activity.description}
        </p>

        <div className="mt-4 space-y-2 text-xs text-slate-600">
          <p className="line-clamp-1"> {formatDateTime(activity.startTime)}</p>
          <p className="line-clamp-1">
             {activity.locationName || activity.address || 'TBA'}
          </p>
        </div>

        <div className="mt-5 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-black text-white transition group-hover:bg-emerald-700">
          Join Activity
        </div>
      </div>
    </Link>
  )
}