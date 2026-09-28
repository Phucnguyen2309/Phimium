import { LocationIcon } from './ActivityDetailIcons.jsx'
import { formatRating, getValidImage } from '../activityDetailUtils.js'

export function ActivityHero({ activity }) {
  const activityImage = getValidImage(activity?.thumbnailUrl)

  return (
    <section className="relative min-h-[420px] overflow-hidden bg-slate-950">
      {activityImage ? (
        <img
          src={activityImage}
          alt={activity?.title}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/10" />

      <div className="absolute bottom-0 left-0 right-0 p-6 text-white sm:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur">
            Phimium activity
          </span>

          <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold">
            Verified host
          </span>
        </div>

        <h1 className="max-w-4xl text-3xl font-black leading-tight tracking-tight sm:text-5xl">
          {activity?.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/90">
          <span className="flex items-center gap-2">
            <span className="text-orange-400">★</span>
            {formatRating(activity?.averageRating)}
          </span>

          {activity?.locationName && (
            <span className="flex items-center gap-2">
              <LocationIcon />
              {activity.locationName}
            </span>
          )}
        </div>
      </div>
    </section>
  )
}