import { SafetyTermsModal } from '@/components/activity/SafetyTermsModal.jsx'
import { BackButton, Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

import { ActivityHero } from './components/ActivityHero.jsx'
import { ActivityHostBookingCard } from './components/ActivityHostBookingCard.jsx'
import { ActivityIncludedSection } from './components/ActivityIncludedSection.jsx'
import { ActivityLocationSection } from './components/ActivityLocationSection.jsx'
import { ActivityQuickLinks } from './components/ActivityQuickLinks.jsx'

export function ActivityDetailView({
  activity,
  error,
  handleJoinActivity,
  handleJoinClick,
  id,
  joinMessage,
  joining,
  loading,
  safetyTermsAccepted,
  setSafetyTermsAccepted,
  setShowSafetyTerms,
  showSafetyTerms,
}) {
  const { t } = useLanguage()

  if (!activity) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Container className="py-8">
          <BackButton />

          {loading || !error ? (
            <p className="text-sm font-semibold text-slate-500">
              {t('activityDetail.loading')}
            </p>
          ) : (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-semibold text-red-600">
              {t('activityDetail.loadError')}
            </div>
          )}
        </Container>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <ActivityHero activity={activity} />

          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
            <main>
              <section>
                <h2 className="text-2xl font-black text-slate-950">
                  {t('activityDetail.about')}
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
                  {activity?.description ||
                    t('activityDetail.noDescription')}
                </p>
              </section>

              <ActivityIncludedSection activity={activity} />

              <ActivityLocationSection activity={activity} />

              <ActivityQuickLinks id={id} />

              {loading && (
                <p className="mt-5 text-sm text-slate-500">
                  {t('activityDetail.loadingShort')}
                </p>
              )}

              {joinMessage && (
                <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {joinMessage}
                </p>
              )}
            </main>

            <ActivityHostBookingCard
              activity={activity}
              joining={joining}
              handleJoinClick={handleJoinClick}
            />
          </div>
        </div>
      </Container>

      <SafetyTermsModal
        open={showSafetyTerms}
        checked={safetyTermsAccepted}
        onCheckedChange={setSafetyTermsAccepted}
        onClose={() => {
          setShowSafetyTerms(false)
          setSafetyTermsAccepted(false)
        }}
        onConfirm={handleJoinActivity}
        loading={joining}
      />
    </div>
  )
}