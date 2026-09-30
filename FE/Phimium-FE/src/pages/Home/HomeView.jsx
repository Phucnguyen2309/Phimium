import { SiteFooter } from '@/components/layout/SiteFooter.jsx'

import { BuddiesSection } from './components/BuddiesSection.jsx'
import { FeaturedActivitiesSection } from './components/FeaturedActivitiesSection.jsx'
import { HeroSection } from './components/HeroSection.jsx'
import { HighlightMarquee } from './components/HighlightMarquee.jsx'
import { JoinStepsSection } from './components/JoinStepsSection.jsx'
import { MeetingPointsSection } from './components/MeetingPointsSection.jsx'
import { PillarsSection } from './components/PillarsSection.jsx'
import { SafetyBannerSection } from './components/SafetyBannerSection.jsx'

export function HomeView({
  activityTypes,
  buddies,
  error,
  featuredActivities,
  isAuthenticated,
  loading,
  meetingPoints,
  retry,
  selectedType,
  setSelectedType,
}) {
  return (
    <div className="bg-slate-50">
      <HeroSection activityTypes={activityTypes} />

      <HighlightMarquee />

      <PillarsSection />

      <FeaturedActivitiesSection
        activities={featuredActivities}
        activityTypes={activityTypes}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        loading={loading}
        error={error}
        onRetry={retry}
      />

      <MeetingPointsSection meetingPoints={meetingPoints} />

      <JoinStepsSection isAuthenticated={isAuthenticated} />

      <BuddiesSection buddies={buddies} />

      <SafetyBannerSection isAuthenticated={isAuthenticated} />

      <SiteFooter />
    </div>
  )
}
