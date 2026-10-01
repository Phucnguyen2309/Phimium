import { Icon, RatingStars } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatDate } from '@/utils/format.js'

export function PendingReviewBanner({ journey, onReview }) {
  const { t } = useLanguage()

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] bg-yellow-400 p-5 shadow-[0_24px_60px_-35px_rgba(202,138,4,0.9)] sm:p-7">
      <span aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-yellow-300/70 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <span className="flex h-12 w-12 shrink-0 animate-bob items-center justify-center rounded-2xl bg-yellow-100 text-blue-950 shadow-sm">
            <Icon name="bell" className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]">
              <span className="rounded-md bg-yellow-100 px-2 py-0.5 text-blue-950">
                {t('userDashboard.review.bannerLabel')}
              </span>
              {journey.start && (
                <span className="text-yellow-900/80">
                  {t('userDashboard.review.bannerDate', { date: formatDate(journey.start) })}
                </span>
              )}
            </p>
            <h2 className="mt-2 text-lg font-extrabold leading-snug text-blue-950 sm:text-xl">
              {t('userDashboard.review.bannerTitle', { buddy: journey.buddyName, title: journey.title })}
            </h2>
            <p className="mt-1 text-sm text-yellow-950/80">{t('userDashboard.review.bannerText')}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-3 rounded-2xl bg-white/95 p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-[11px] font-semibold text-slate-500">{t('userDashboard.review.quickRating')}</p>
            <RatingStars
              value={0}
              onChange={(rating) => onReview(journey, rating)}
              size="h-6 w-6"
              label={t('userDashboard.review.quickRating')}
            />
          </div>
          <button
            type="button"
            onClick={() => onReview(journey)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-900"
          >
            <Icon name="pencil-square" className="h-4 w-4" />
            {t('userDashboard.review.write')}
          </button>
        </div>
      </div>
    </section>
  )
}
