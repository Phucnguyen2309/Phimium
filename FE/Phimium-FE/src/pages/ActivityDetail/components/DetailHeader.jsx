import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'
import { ROUTES } from '@/routes/paths.js'

export function DetailHeader({ activity, groupLimit }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  // Chia sẻ: điện thoại dùng Web Share, máy tính thì sao chép liên kết
  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ title: activity.title, url })
        return
      }

      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Người dùng huỷ chia sẻ -> bỏ qua
    }
  }

  return (
    <header>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav aria-label={t('activities.breadcrumb')} className="min-w-0 text-xs text-slate-500">
          <ol className="flex min-w-0 items-center gap-2">
            <li className="shrink-0">
              <Link to={ROUTES.home} className="transition hover:text-blue-950">
                {t('nav.home')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="shrink-0">
              <Link to={ROUTES.activities} className="transition hover:text-blue-950">
                {t('activities.breadcrumbCurrent')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="truncate font-semibold text-blue-800">
              {activity.title}
            </li>
          </ol>
        </nav>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-white hover:text-blue-950"
        >
          <Icon name={copied ? 'check' : 'share'} className="h-4 w-4" />
          {copied ? t('activityDetail.header.copied') : t('activityDetail.header.share')}
        </button>
      </div>

      <div className="mt-5 flex animate-fade-up flex-wrap items-center gap-2">
        {activity.activityType && (
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-bold text-blue-950">
            {formatActivityType(activity.activityType)}
          </span>
        )}
        {groupLimit > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-900 ring-1 ring-blue-100">
            <Icon name="user-group" className="h-3.5 w-3.5" />
            {t('activityDetail.header.smallGroup', { count: groupLimit })}
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div style={{ animationDelay: '80ms' }} className="min-w-0 animate-fade-up">
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-blue-950 sm:text-4xl lg:text-[2.75rem]">
            {activity.title}
          </h1>
          {(activity.locationName || activity.address) && (
            <p className="mt-2 flex items-center gap-1.5 text-[15px] text-slate-600">
              <Icon name="map-pin" className="h-4 w-4 shrink-0 text-blue-900" />
              {[activity.locationName, activity.address].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

      </div>
    </header>
  )
}
