import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { getLocale } from '@/utils/i18n.js'

import { getItineraryTotalMinutes } from '@/pages/ActivityDetail/activityDetailMapper.js'

// 95 -> "1 giờ 35 phút" / "1h 35m"
const formatMinutes = (minutes, t) => {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60

  if (hours && rest) return t('activityDetail.itinerary.hoursMinutes', { hours, minutes: rest })
  if (hours) return t('activityDetail.itinerary.hours', { hours })
  return t('activityDetail.itinerary.minutes', { minutes: rest })
}

// Giờ đến điểm dừng = giờ khởi hành của ca đang chọn + offsetMinutes
const formatArrival = (departureStart, offsetMinutes) => {
  const time = new Date(departureStart.getTime() + offsetMinutes * 60000)
  return time.toLocaleTimeString(getLocale(), { hour: '2-digit', minute: '2-digit' })
}

function StopCard({ stop, index, isLast, departureStart }) {
  const { t } = useLanguage()
  const hasOffset = stop.offsetMinutes !== null

  return (
    <li className="relative flex gap-3 sm:gap-4">
      {/* Cột số thứ tự + đường nối giữa các điểm */}
      <div className="flex shrink-0 flex-col items-center">
        <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-blue-950 font-display text-sm font-bold text-yellow-400 ring-4 ring-white">
          {index + 1}
        </span>
        {!isLast && <span aria-hidden="true" className="mt-1 w-0.5 flex-1 rounded-full bg-gradient-to-b from-blue-200 to-slate-100" />}
      </div>

      <article className={`group min-w-0 flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white transition hover:border-slate-300 hover:shadow-[0_18px_40px_-28px_rgba(22,36,86,0.45)] ${isLast ? '' : 'mb-4'}`}>
        <div className="flex flex-col sm:flex-row">
          <div className="relative aspect-[16/9] shrink-0 overflow-hidden bg-slate-100 sm:aspect-auto sm:w-44 md:w-52">
            {stop.image ? (
              <img
                src={stop.image}
                alt={stop.title}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105 sm:absolute sm:inset-0"
              />
            ) : (
              <span className="flex h-full min-h-28 w-full items-center justify-center text-slate-300">
                <Icon name="map-pin" className="h-8 w-8" />
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
            <h3 className="text-base font-extrabold leading-snug text-blue-950 sm:text-[17px]">{stop.title}</h3>
            {stop.description && (
              <p className="mt-1.5 whitespace-pre-line text-sm leading-6 text-slate-600">{stop.description}</p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-3 text-xs font-semibold text-blue-800">
              {stop.durationMinutes > 0 && (
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="clock" className="h-4 w-4" />
                  {t('activityDetail.itinerary.stopDuration', { duration: formatMinutes(stop.durationMinutes, t) })}
                </span>
              )}
              {hasOffset && (
                <span className="inline-flex items-center gap-1.5 text-slate-500">
                  <Icon name="map-pin" className="h-4 w-4" />
                  {departureStart
                    ? t('activityDetail.itinerary.arriveAt', { time: formatArrival(departureStart, stop.offsetMinutes) })
                    : stop.offsetMinutes === 0
                      ? t('activityDetail.itinerary.atStart')
                      : t('activityDetail.itinerary.afterStart', { duration: formatMinutes(stop.offsetMinutes, t) })}
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </li>
  )
}

/** Các điểm dừng chân của tour (itineraryStops). Không có điểm nào thì ẩn cả mục. */
export function ItinerarySection({ stops = [], departureStart = null }) {
  const { t } = useLanguage()

  if (stops.length === 0) return null

  const totalMinutes = getItineraryTotalMinutes(stops)

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-blue-800">
            <Icon name="map" className="h-4 w-4" />
            {t('activityDetail.itinerary.eyebrow')}
          </p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-blue-950">
            {t('activityDetail.itinerary.title', { count: stops.length })}
          </h2>
        </div>
        {totalMinutes > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-900 ring-1 ring-blue-100">
            <Icon name="clock" className="h-4 w-4" />
            {t('activityDetail.itinerary.total', { duration: formatMinutes(totalMinutes, t) })}
          </span>
        )}
      </div>

      {departureStart && (
        <p className="mt-2 text-xs text-slate-500">{t('activityDetail.itinerary.timeNote')}</p>
      )}

      <ol className="mt-6">
        {stops.map((stop, index) => (
          <StopCard
            key={stop.id}
            stop={stop}
            index={index}
            isLast={index === stops.length - 1}
            departureStart={departureStart}
          />
        ))}
      </ol>
    </section>
  )
}
