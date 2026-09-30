import { Link } from 'react-router-dom'

import { Container, Icon, Reveal } from '@/components/common'
import { SiteFooter } from '@/components/layout/SiteFooter.jsx'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

import { TourCard } from './components/TourCard.jsx'
import { TourFilters } from './components/TourFilters.jsx'

function TourCardSkeleton() {
  return (
    <div className="grid gap-6 rounded-[1.75rem] border border-slate-200/80 bg-white p-5 lg:grid-cols-[21rem_1fr] lg:gap-8 2xl:grid-cols-[27rem_1fr]">
      <div className="skeleton aspect-[4/3] rounded-2xl" />
      <div className="space-y-3 py-1">
        <div className="skeleton h-3 w-40 rounded-full" />
        <div className="skeleton h-7 w-3/4 rounded-lg" />
        <div className="skeleton h-4 w-full rounded-full" />
        <div className="skeleton h-4 w-5/6 rounded-full" />
        <div className="skeleton h-12 w-full rounded-xl" />
        <div className="flex gap-3 pt-6">
          <div className="skeleton h-14 flex-1 rounded-xl" />
          <div className="skeleton h-14 flex-1 rounded-xl" />
          <div className="skeleton h-14 w-32 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, setPage }) {
  const { t } = useLanguage()

  if (totalPages <= 1) return null

  const goTo = (value) => {
    setPage(value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const buttonClass =
    'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <nav aria-label={t('activities.pagination')} className="mt-12 flex justify-center">
      <div className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1.5 shadow-sm">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => goTo(page - 1)}
          aria-label={t('common.previousPage')}
          className={`${buttonClass} text-slate-600 hover:bg-slate-100`}
        >
          <Icon name="chevron-left" className="h-4 w-4" strokeWidth={2} />
        </button>

        {Array.from({ length: totalPages }, (_, index) => index + 1).map((item) => (
          <button
            key={item}
            type="button"
            aria-current={page === item ? 'page' : undefined}
            onClick={() => goTo(item)}
            className={`${buttonClass} ${
              page === item ? 'bg-blue-950 text-yellow-400' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {item}
          </button>
        ))}

        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => goTo(page + 1)}
          aria-label={t('common.nextPage')}
          className={`${buttonClass} text-slate-600 hover:bg-slate-100`}
        >
          <Icon name="chevron-right" className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </nav>
  )
}

export function ActivitiesView({
  activities,
  changeFilter,
  clearKeyword,
  error,
  filteredActivities,
  filters,
  hasActiveFilters,
  keyword,
  loading,
  locationOptions,
  page,
  paginatedActivities,
  resetFilters,
  retry,
  setPage,
  totalPages,
  typeOptions,
}) {
  const { t } = useLanguage()

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[34rem]">
        <span className="absolute -left-24 top-24 h-72 w-72 animate-drift rounded-full bg-yellow-100/70 blur-3xl" />
        <span className="absolute right-0 top-0 h-96 w-96 animate-drift-reverse rounded-full bg-blue-100/70 blur-3xl" />
      </div>

      <Container size="wide" className="pb-24 pt-8 sm:pt-10">
        <nav aria-label={t('activities.breadcrumb')} className="animate-fade-up text-xs text-slate-500">
          <ol className="flex items-center gap-2">
            <li>
              <Link to={ROUTES.home} className="transition hover:text-blue-950">
                {t('nav.home')}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="font-semibold text-blue-800">
              {t('activities.breadcrumbCurrent')}
            </li>
          </ol>
        </nav>

        <header className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span
              style={{ animationDelay: '60ms' }}
              className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-900"
            >
              <Icon name="check-circle" className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2} />
              {t('activities.hero.badge')}
            </span>
            <h1
              style={{ animationDelay: '120ms' }}
              className="mt-4 animate-fade-up text-3xl font-extrabold leading-tight tracking-tight text-blue-950 sm:text-4xl lg:text-[2.6rem]"
            >
              {t('activities.hero.title')}
            </h1>
            <p
              style={{ animationDelay: '180ms' }}
              className="mt-3 max-w-2xl animate-fade-up text-[15px] leading-7 text-slate-600"
            >
              {t('activities.hero.subtitle')}
            </p>
          </div>

          <div
            style={{ animationDelay: '240ms' }}
            className="flex shrink-0 animate-fade-up items-center gap-3 self-start rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur lg:self-auto"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-blue-950">
              <Icon name="shield-check" className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold text-blue-950">
                {t('activities.hero.trustTitle')}
              </span>
              <span className="block text-[11px] text-slate-500">
                {t('activities.hero.trustText')}
              </span>
            </span>
          </div>
        </header>

        <div style={{ animationDelay: '300ms' }} className="mt-8 animate-fade-up">
          <TourFilters
            changeFilter={changeFilter}
            clearKeyword={clearKeyword}
            filters={filters}
            hasActiveFilters={hasActiveFilters}
            keyword={keyword}
            locationOptions={locationOptions}
            resetFilters={resetFilters}
            typeOptions={typeOptions}
          />
        </div>

        <section aria-live="polite" className="mt-8">
          {loading ? (
            <div className="space-y-6">
              <TourCardSkeleton />
              <TourCardSkeleton />
            </div>
          ) : error ? (
            <div className="rounded-[1.75rem] border border-red-100 bg-red-50/70 px-6 py-16 text-center">
              <p className="font-semibold text-red-700">{t('activities.loadErrorRetry')}</p>
              <button
                type="button"
                onClick={retry}
                className="mt-4 rounded-full bg-blue-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/70 px-6 py-16 text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <Icon name="magnifying-glass" className="h-6 w-6" />
              </span>
              <h2 className="mt-4 text-lg font-bold text-blue-950">
                {activities.length === 0 ? t('activities.noToursTitle') : t('activities.emptyTitle')}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                {activities.length === 0 ? t('activities.noToursText') : t('activities.emptyText')}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-full border border-blue-950 px-5 py-2 text-sm font-bold text-blue-950 transition hover:bg-blue-950 hover:text-white"
                >
                  {t('activities.filters.reset')}
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                {t('activities.resultCount', { count: filteredActivities.length })}
              </p>
              <div className="space-y-6">
                {paginatedActivities.map((activity, index) => (
                  <Reveal key={activity.id} delay={Math.min(index, 3) * 80}>
                    <TourCard activity={activity} />
                  </Reveal>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </>
          )}
        </section>
      </Container>

      <SiteFooter />
    </div>
  )
}
