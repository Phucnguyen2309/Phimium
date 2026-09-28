import SafetyTermsModal from '@/components/activity/SafetyTermsModal.jsx'
import { Container } from '@/components/common'

import { ActivityHero } from './components/ActivityHero.jsx'
import { ActivityHostBookingCard } from './components/ActivityHostBookingCard.jsx'
import { ActivityIncludedSection } from './components/ActivityIncludedSection.jsx'
import { ActivityLocationSection } from './components/ActivityLocationSection.jsx'
import { ActivityQuickLinks } from './components/ActivityQuickLinks.jsx'

export function ActivityDetailView({
  activity,
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
  return (
    <div className="min-h-screen bg-slate-50">
      <Container className="py-8">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
          <ActivityHero activity={activity} />

          <div className="grid gap-8 p-6 lg:grid-cols-[1fr_360px] lg:p-8">
            <main>
              <section>
                <h2 className="text-2xl font-black text-slate-950">
                  About this experience
                </h2>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-700">
                  {activity?.description ||
                    'Thông tin mô tả hoạt động chưa được cập nhật.'}
                </p>
              </section>

              <ActivityIncludedSection activity={activity} />

              <ActivityLocationSection activity={activity} />

              <ActivityQuickLinks id={id} />

              {loading && (
                <p className="mt-5 text-sm text-slate-500">
                  Đang tải chi tiết...
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