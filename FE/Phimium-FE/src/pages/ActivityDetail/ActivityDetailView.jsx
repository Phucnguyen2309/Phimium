import { Link } from 'react-router-dom'

import { SafetyTermsModal } from '@/components/activity/SafetyTermsModal.jsx'
import { Container, Icon, Reveal } from '@/components/common'
import { SiteFooter } from '@/components/layout/SiteFooter.jsx'
import { useLanguage } from '@/context/languageContext.js'
import { formatPrice } from '@/features/activity/activityMapper.js'
import { buildActivityGuidelinesPath, ROUTES } from '@/routes/paths.js'

import { getGroupLimit } from './activityDetailMapper.js'
import { BookingCard } from './components/BookingCard.jsx'
import { DetailHeader } from './components/DetailHeader.jsx'
import { DetailHero } from './components/DetailHero.jsx'
import { HostSection } from './components/HostSection.jsx'
import { MeetingPointSection } from './components/MeetingPointSection.jsx'

const COMMITMENTS = [
  { id: 'localBuddy', icon: 'user' },
  { id: 'smallGroups', icon: 'user-group' },
  { id: 'clearPricing', icon: 'banknotes' },
]

function DetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="skeleton h-4 w-64 rounded-full" />
      <div className="skeleton h-10 w-2/3 rounded-xl" />
      <div className="skeleton aspect-[21/9] rounded-[1.75rem]" />
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
        <div className="skeleton h-80 rounded-[1.75rem]" />
        <div className="skeleton h-96 rounded-[1.75rem]" />
      </div>
    </div>
  )
}

export function ActivityDetailView(props) {
  const {
    activity,
    closeSafetyTerms,
    confirmBooking,
    booking,
    dateGroups,
    error,
    loading,
    retry,
    safetyTermsAccepted,
    setSafetyTermsAccepted,
    showSafetyTerms,
  } = props
  const { t } = useLanguage()

  const upcomingCount = dateGroups.reduce((sum, group) => sum + group.departures.length, 0)

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]">
        <span className="absolute -left-24 top-10 h-72 w-72 animate-drift rounded-full bg-yellow-100/70 blur-3xl" />
        <span className="absolute right-0 top-0 h-96 w-96 animate-drift-reverse rounded-full bg-blue-100/70 blur-3xl" />
      </div>

      <Container size="wide" className="pb-32 pt-8 sm:pt-10 lg:pb-24">
        {loading ? (
          <DetailSkeleton />
        ) : error || !activity ? (
          <div className="rounded-[1.75rem] border border-red-100 bg-red-50/70 px-6 py-16 text-center">
            <p className="font-semibold text-red-700">{t('activityDetail.loadError')}</p>
            <div className="mt-4 flex justify-center gap-3">
              <button
                type="button"
                onClick={retry}
                className="rounded-full bg-blue-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blue-900"
              >
                {t('common.retry')}
              </button>
              <Link
                to={ROUTES.activities}
                className="rounded-full px-5 py-2.5 text-sm font-bold text-blue-950 ring-1 ring-slate-300 transition hover:bg-white"
              >
                {t('activityDetail.backToTours')}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <DetailHeader activity={activity} groupLimit={getGroupLimit(activity)} />
            <DetailHero activity={activity} groupLimit={getGroupLimit(activity)} upcomingCount={upcomingCount} />

            <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_24rem] 2xl:grid-cols-[1fr_27rem]">
              <div className="min-w-0 space-y-8">
                <Reveal as="section" className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
                  <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-yellow-700">
                    <Icon name="sparkles" className="h-4 w-4" />
                    {t('activityDetail.aboutEyebrow')}
                  </p>
                  <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-blue-950">{t('activityDetail.about')}</h2>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-slate-700">
                    {activity.description || t('activityDetail.noDescription')}
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {COMMITMENTS.map((item) => (
                      <div key={item.id} className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-blue-900 shadow-sm">
                          <Icon name={item.icon} className="h-5 w-5" />
                        </span>
                        <p className="mt-3 text-sm font-bold text-blue-950">{t(`home.commitments.${item.id}.title`)}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{t(`home.commitments.${item.id}.text`)}</p>
                      </div>
                    ))}
                  </div>
                </Reveal>

                <Reveal>
                  <HostSection />
                </Reveal>

                <Reveal>
                  <Link
                    to={buildActivityGuidelinesPath(activity.id)}
                    className="group flex items-center gap-4 rounded-[1.75rem] border border-blue-100 bg-blue-50/70 p-5 transition hover:bg-blue-50 sm:p-6"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-blue-900 shadow-sm">
                      <Icon name="shield-check" className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-extrabold text-blue-950">{t('activityDetail.guidelineCard.title')}</span>
                      <span className="block text-sm text-slate-600">{t('activityDetail.guidelineCard.text')}</span>
                    </span>
                    <Icon name="arrow-right" className="h-5 w-5 shrink-0 text-blue-900 transition group-hover:translate-x-1" strokeWidth={2} />
                  </Link>
                </Reveal>

                <Reveal>
                  <MeetingPointSection activity={activity} />
                </Reveal>
              </div>

              <div id="booking" className="scroll-mt-24 lg:sticky lg:top-24">
                <BookingCard {...props} />
              </div>
            </div>
          </>
        )}
      </Container>

      <SiteFooter />

      {activity && !loading && (
        // Thanh đặt tour cố định ở đáy màn hình điện thoại
        <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-10px_30px_-15px_rgba(22,36,86,0.35)] backdrop-blur lg:hidden">
          <p className="min-w-0">
            <span className="block text-[11px] text-slate-500">{t('activities.card.priceFrom')}</span>
            <span className="block truncate text-lg font-extrabold text-blue-950">
              {formatPrice(activity.participationFee)}
            </span>
          </p>
          <a
            href="#booking"
            className="shine shrink-0 rounded-xl bg-yellow-400 px-5 py-3 text-sm font-extrabold text-blue-950"
          >
            {t('activityDetail.mobileBook')}
          </a>
        </div>
      )}

      <SafetyTermsModal
        open={showSafetyTerms}
        checked={safetyTermsAccepted}
        onCheckedChange={setSafetyTermsAccepted}
        onClose={closeSafetyTerms}
        onConfirm={confirmBooking}
        loading={booking}
      />
    </div>
  )
}
