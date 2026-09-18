import SafetyTermsModal from '@/components/activity/SafetyTermsModal.jsx'

import { ActivityHero } from './components/ActivityHero.jsx'
import { ActivityMetrics } from './components/ActivityMetrics.jsx'
import { ActivityIncludedSection } from './components/ActivityIncludedSection.jsx'
import { ActivityFacesSection } from './components/ActivityFacesSection.jsx'
import { ActivityTimeline } from './components/ActivityTimeline.jsx'
import { ActivityBookingCard } from './components/ActivityBookingCard.jsx'
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
    <div className="min-h-screen bg-white font-sans pb-24">
      <ActivityHero activity={activity} />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Cột trái: Nội dung chính */}
          <div className="lg:col-span-2 space-y-10">
            <ActivityMetrics activity={activity} />

            <section>
              <h2 className="text-2xl font-black text-slate-950">
                The Experience
              </h2>

              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {activity?.description ||
                  "Explore Saigon through its flavors, neighborhoods, and the stories of local vendors. This curated walking journey goes beyond the standard tourist trails, diving deep into the alleys where the city's culinary soul truly lives."}
              </p>
            </section>

            <ActivityIncludedSection activity={activity} />

            <ActivityFacesSection />

            <ActivityTimeline />

            <div className="space-y-8 pt-6">
              <ActivityLocationSection activity={activity} />
              <ActivityQuickLinks id={id} />
            </div>

            {loading && (
              <div>
                <p className="mt-5 text-sm text-slate-500">Loading details...</p>
              </div>
            )}

            {joinMessage && (
              <div>
                <p className="mt-5 rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {joinMessage}
                </p>
              </div>
            )}
          </div>

          {/* Cột phải: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <ActivityBookingCard
              activity={activity}
              handleJoinClick={handleJoinClick}
              joining={joining}
            />
          </div>
        </div>
      </div>

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

