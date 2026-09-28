import { Link } from 'react-router-dom'

import { buildActivityDetailPath } from '@/routes/paths.js'

const getValidImage = (url) => {
  if (!url || url === 'string') return null
  return url
}

const getFeeLabel = (fee) => {
  const value = Number(fee ?? 0)

  if (value <= 0) return 'Miễn phí'

  return `${value.toLocaleString('vi-VN')} VND`
}

const getActivityTypeLabel = (type) => {
  if (!type) return 'Hoạt động'

  return String(type)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

const CARD_HEIGHT = {
  feature: 'h-[420px]',
  wide: 'h-[185px]',
  small: 'h-[210px]',
}

const TITLE_SIZE = {
  feature: 'text-2xl',
  wide: 'text-lg',
  small: 'text-base',
}

function ActivityImageFallback({ title }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 p-6 text-center">
      <div>
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-xl font-black text-white">
          P
        </div>

        <p className="mt-3 text-sm font-bold text-emerald-800">
          {title || 'Hoạt động PHIMIUM'}
        </p>
      </div>
    </div>
  )
}

export default function PopularActivityCard({
  activity,
  variant = 'small',
  className = '',
}) {
  if (!activity) return null

  const imageUrl = getValidImage(activity.thumbnailUrl)
  const isFeature = variant === 'feature'
  const isWide = variant === 'wide'

  return (
    <Link
      to={buildActivityDetailPath(activity.id)}
      state={{ activity }}
      className={`group relative block overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(15,23,42,0.18)] ${
        CARD_HEIGHT[variant]
      } ${className}`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={activity.title}
          className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0">
          <ActivityImageFallback title={activity.title} />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

      {isFeature && (
        <div className="absolute left-5 top-5">
          <span className="rounded-md bg-orange-500 px-3 py-1.5 text-[11px] font-black text-white shadow-sm">
            Xu hướng mới
          </span>
        </div>
      )}

      {!isFeature && (
        <div className="absolute right-4 top-4">
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-black text-white shadow-sm">
            Đã xác minh
          </span>
        </div>
      )}

      <div
        className={`absolute bottom-0 left-0 right-0 ${
          isFeature ? 'p-6' : 'p-4'
        }`}
      >
        <h3
          className={`font-black leading-tight tracking-tight text-white ${
            TITLE_SIZE[variant]
          }`}
        >
          {isFeature
            ? activity.title
            : isWide
              ? activity.title
              : getActivityTypeLabel(activity.activityType)}
        </h3>

        <p
          className={`mt-2 line-clamp-1 text-white/90 ${
            isFeature ? 'text-sm' : 'text-xs'
          }`}
        >
          {isFeature
            ? activity.description || 'Tham gia hoạt động này cùng Buddy mới.'
            : isWide
              ? activity.locationName || activity.address || 'Tham gia hoạt động'
              : activity.title}
        </p>

        {isFeature && (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-bold text-white"> 
            <span>
              {activity.participationFee > 0
                ? getFeeLabel(activity.participationFee)
                : 'Miễn phí'}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}