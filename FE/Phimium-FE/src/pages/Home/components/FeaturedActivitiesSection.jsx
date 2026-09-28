import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'
import { ALL_TYPES } from '@/pages/Home/homeMapper.js'
import { ROUTES } from '@/routes/paths.js'

import { FeaturedActivityCard } from './FeaturedActivityCard.jsx'

function StateBox({ tone = 'default', children }) {
  const toneClass =
    tone === 'error'
      ? 'border-red-200 bg-red-50 text-red-600'
      : 'border-blue-200 bg-white text-slate-500'

  return (
    <div
      className={`rounded-2xl border border-dashed py-16 text-center text-sm font-semibold ${toneClass}`}
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
  loading = false,
  error = null,
}) {
  const { t } = useLanguage()

  return (
    <section id="popular-activities" className="scroll-mt-16 bg-slate-50 py-20">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
              {t('home.featured.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
              {t('home.featured.title')}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {t('home.featured.subtitle')}
            </p>
          </div>

          {activityTypes.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                {t('home.featured.filterBy')}
              </span>
              {activityTypes.map((type) => {
                const isActive = type === selectedType

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onSelectType?.(type)}
                    className={`rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? 'bg-blue-950 text-white'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-800'
                    }`}
                  >
                    {type === ALL_TYPES ? t('common.all') : formatActivityType(type)}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="mt-10">
          {loading ? (
            <StateBox>{t('activities.loading')}</StateBox>
          ) : error ? (
            <StateBox tone="error">
              {t('activities.loadErrorRetry')}
            </StateBox>
          ) : activities.length === 0 ? (
            <StateBox>{t('home.featured.empty')}</StateBox>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activities.map((activity) => (
                <FeaturedActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 text-center">
          <Link
            to={ROUTES.activities}
            className="inline-flex items-center gap-2 rounded-lg border border-blue-950 px-6 py-3 text-sm font-black text-blue-950 transition hover:bg-blue-950 hover:text-white"
          >
            {t('home.featured.viewAll')} →
          </Link>
        </div>
      </Container>
    </section>
  )
}
