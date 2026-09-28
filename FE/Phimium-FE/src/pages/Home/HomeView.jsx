import { SiteFooter } from '@/components/layout/SiteFooter.jsx'

import { BuddiesSection } from './components/BuddiesSection.jsx'
import { FeaturedActivitiesSection } from './components/FeaturedActivitiesSection.jsx'
import { HeroSection } from './components/HeroSection.jsx'
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
  selectedType,
  setSelectedType,
}) {
  return (
    <div className="bg-slate-50">
      <HeroSection activityTypes={activityTypes} />

      <PillarsSection />

      <FeaturedActivitiesSection
        activities={featuredActivities}
        activityTypes={activityTypes}
        selectedType={selectedType}
        onSelectType={setSelectedType}
        loading={loading}
        error={error}
      />

      <MeetingPointsSection meetingPoints={meetingPoints} />

      <JoinStepsSection isAuthenticated={isAuthenticated} />

      <BuddiesSection buddies={buddies} />

      <SafetyBannerSection isAuthenticated={isAuthenticated} />

      <SiteFooter />
    </div>
  )
}
