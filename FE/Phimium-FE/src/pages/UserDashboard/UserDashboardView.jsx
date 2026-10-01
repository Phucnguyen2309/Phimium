import { Link } from 'react-router-dom'

import { AuthAlert, Container, Icon, Reveal } from '@/components/common'
import { SiteFooter } from '@/components/layout/SiteFooter.jsx'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

import { JourneyCard } from './components/JourneyCard.jsx'
import { MyGroupsCard } from './components/MyGroupsCard.jsx'
import { PaymentsCard } from './components/PaymentsCard.jsx'
import { PendingReviewBanner } from './components/PendingReviewBanner.jsx'
import { ProfileCard } from './components/ProfileCard.jsx'
import { ReviewModal } from './components/ReviewModal.jsx'
import { JOURNEY_FILTER } from './userDashboardMapper.js'

const FILTERS = [
  JOURNEY_FILTER.all,
  JOURNEY_FILTER.upcoming,
  JOURNEY_FILTER.completed,
  JOURNEY_FILTER.cancelled,
]

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-64 rounded-[1.75rem]" />
      <div className="skeleton h-10 w-64 rounded-full" />
      <div className="skeleton h-48 rounded-[1.5rem]" />
      <div className="skeleton h-48 rounded-[1.5rem]" />
    </div>
  )
}

export function UserDashboardView({
  actionMessage,
  cancel,
  checkIn,
  closeReview,
  error,
  filter,
  filterCounts,
  groups,
  loading,
  openReview,
  payNow,
  payments,
  pendingActions,
  pendingReview,
  retry,
  reviewTarget,
  setFilter,
  stats,
  submitReview,
  successMessageKey,
  user,
  visibleJourneys,
}) {
  const { t } = useLanguage()
  const visibleFilters = FILTERS.filter(
    (item) => item !== JOURNEY_FILTER.cancelled || filterCounts[JOURNEY_FILTER.cancelled],
  )

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]">
        <span className="absolute -left-24 top-10 h-72 w-72 animate-drift rounded-full bg-blue-100/70 blur-3xl" />
        <span className="absolute right-0 top-40 h-80 w-80 animate-drift-reverse rounded-full bg-yellow-100/70 blur-3xl" />
      </div>

      <Container size="wide" className="space-y-8 pb-24 pt-8 sm:pt-10">
        {successMessageKey && <AuthAlert tone="success">{t(successMessageKey)}</AuthAlert>}

        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <div className="rounded-[1.75rem] border border-red-100 bg-red-50/70 px-6 py-16 text-center">
            <p className="font-semibold text-red-700">{t('userDashboard.loadError')}</p>
            <button
              type="button"
              onClick={retry}
              className="mt-4 rounded-full bg-blue-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"
            >
              {t('common.retry')}
            </button>
          </div>
        ) : (
          <>
            <div className="animate-fade-up">
              <ProfileCard user={user} stats={stats} />
            </div>

            {pendingReview && (
              <div style={{ animationDelay: '120ms' }} className="animate-fade-up">
                <PendingReviewBanner journey={pendingReview} onReview={openReview} />
              </div>
            )}

            <section aria-labelledby="journeys-title">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-800">
                    {t('userDashboard.journeys.eyebrow')}
                  </p>
                  <h2 id="journeys-title" className="mt-1 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">
                    {t('userDashboard.journeys.title')}
                  </h2>
                </div>

                <div
                  role="tablist"
                  aria-label={t('userDashboard.journeys.filterLabel')}
                  className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200"
                >
                  {visibleFilters.map((item) => {
                    const isActive = filter === item

                    return (
                      <button
                        key={item}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setFilter(item)}
                        className={`shrink-0 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition ${
                          isActive ? 'bg-blue-950 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-blue-950'
                        }`}
                      >
                        {t(`userDashboard.journeys.filters.${item}`)} ({filterCounts[item] ?? 0})
                      </button>
                    )
                  })}
                </div>
              </div>

              {actionMessage && (
                <div className="mt-5">
                  <AuthAlert tone={actionMessage.tone}>{actionMessage.text}</AuthAlert>
                </div>
              )}

              {visibleJourneys.length === 0 ? (
                <div className="mt-6 rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
                    <Icon name="map" className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-blue-950">
                    {t(`userDashboard.journeys.empty.${filter}`)}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500">{t('userDashboard.journeys.emptyText')}</p>
                  <Link
                    to={ROUTES.activities}
                    className="shine mt-5 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-extrabold text-blue-950 transition hover:bg-yellow-300"
                  >
                    {t('userDashboard.journeys.explore')}
                    <Icon name="arrow-right" className="h-4 w-4" strokeWidth={2} />
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  {visibleJourneys.map((journey, index) => (
                    <Reveal key={journey.id} delay={Math.min(index, 3) * 80}>
                      <JourneyCard
                        journey={journey}
                        pendingAction={pendingActions[journey.id]}
                        onCheckIn={checkIn}
                        onCancel={cancel}
                        onPay={payNow}
                        onReview={openReview}
                      />
                    </Reveal>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_24rem] 2xl:grid-cols-[1fr_28rem]">
              <MyGroupsCard groups={groups} />
              <PaymentsCard payments={payments} />
            </div>
          </>
        )}
      </Container>

      <SiteFooter />

      {reviewTarget && (
        <ReviewModal
          key={`${reviewTarget.journey.id}-${reviewTarget.initialRating}`}
          target={reviewTarget}
          onClose={closeReview}
          onSubmit={submitReview}
        />
      )}
    </div>
  )
}
