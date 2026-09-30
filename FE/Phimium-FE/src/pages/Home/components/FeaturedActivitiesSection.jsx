import { Link } from 'react-router-dom'

import { Container, Icon, Reveal } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'
import { ALL_TYPES } from '@/pages/Home/homeMapper.js'
import { ROUTES } from '@/routes/paths.js'

import { FeaturedActivityCard } from './FeaturedActivityCard.jsx'
import { SectionHeading } from './SectionHeading.jsx'

const SKELETON_COUNT = 4

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white">
      <div className="skeleton h-60" />
      <div className="space-y-3 p-6">
        <div className="skeleton h-3 w-2/3 rounded-full" />
        <div className="skeleton h-6 w-4/5 rounded-full" />
        <div className="skeleton h-3 w-full rounded-full" />
        <div className="skeleton h-3 w-5/6 rounded-full" />
        <div className="flex items-end justify-between pt-6">
          <div className="skeleton h-8 w-28 rounded-lg" />
          <div className="skeleton h-10 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function StateBox({ tone = 'default', children }) {
  const toneClass =
    tone === 'error'
      ? 'border-red-200 bg-red-50/60 text-red-600'
      : 'border-slate-200 bg-white text-slate-500'

  return (
    <div
      className={`flex flex-col items-center gap-4 rounded-3xl border border-dashed px-6 py-20 text-center text-sm font-medium ${toneClass}`}
    >
      {children}
    </div>
  )
}

export function FeaturedActivitiesSection({
  activities = [],
  activityTypes = [ALL_TYPES],
  selectedType = ALL_TYPES,
  onSelectType,
  onRetry,
  loading = false,
  error = null,
}) {
  const { t } = useLanguage()

  return (
    <section id="popular-activities" className="relative bg-slate-50 py-24 sm:py-28">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <Container>
        <Reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            align="left"
            eyebrow={t('home.featured.eyebrow')}
            title={t('home.featured.title')}
            subtitle={t('home.featured.subtitle')}
          />

          {activityTypes.length > 1 && (
            <div
              role="group"
              aria-label={t('home.featured.filterBy')}
              className="flex flex-wrap items-center gap-2 lg:justify-end"
            >
              {activityTypes.map((type) => {
                const isActive = type === selectedType

                return (
                  <button
                    key={type}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => onSelectType?.(type)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold transition duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-900/15 ${
                      isActive
                        ? 'bg-blue-950 text-white shadow-md shadow-blue-950/20'
                        : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-blue-950 hover:ring-blue-900/30'
                    }`}
                  >
                    {type === ALL_TYPES ? t('common.all') : formatActivityType(type)}
                  </button>
                )
              })}
            </div>
          )}
        </Reveal>

        <div className="mt-14 min-h-[420px]">
          {loading ? (
            <div className="grid gap-7 md:grid-cols-2" aria-busy="true" aria-label={t('activities.loading')}>
              {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : error ? (
            <StateBox tone="error">
              {t('activities.loadErrorRetry')}
              {onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="rounded-full bg-white px-5 py-2 text-xs font-bold text-red-600 ring-1 ring-red-200 transition hover:bg-red-600 hover:text-white"
                >
                  {t('common.retry')}
                </button>
              )}
            </StateBox>
          ) : activities.length === 0 ? (
            <StateBox>{t('home.featured.empty')}</StateBox>
          ) : (
            <div key={selectedType} className="grid gap-7 md:grid-cols-2">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <FeaturedActivityCard activity={activity} />
                </div>
              ))}
            </div>
          )}
        </div>

        <Reveal className="mt-14 text-center">
          <Link
            to={ROUTES.activities}
            className="group inline-flex items-center gap-3 rounded-full border border-blue-950 px-7 py-3.5 text-sm font-semibold text-blue-950 transition duration-300 hover:bg-blue-950 hover:text-white"
          >
            {t('home.featured.viewAll')}
            <Icon
              name="arrow-right"
              className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
              strokeWidth={2}
            />
          </Link>
        </Reveal>
      </Container>
    </section>
  )
}
