import { useState } from 'react'
import { SiteFooter } from '@/components/layout/SiteFooter.jsx'
import { AiMatchmakerBanner } from '@/features/aiMatchmaker/AiMatchmakerBanner.jsx'
import { AiMatchmakerFloatingButton } from '@/features/aiMatchmaker/AiMatchmakerFloatingButton.jsx'
import { AiMatchmakerModal } from '@/features/aiMatchmaker/AiMatchmakerModal.jsx'

import { FeaturedActivitiesSection } from './components/FeaturedActivitiesSection.jsx'
import { HeroSection } from './components/HeroSection.jsx'
import { HighlightMarquee } from './components/HighlightMarquee.jsx'
import { JoinStepsSection } from './components/JoinStepsSection.jsx'
import { MeetingPointsSection } from './components/MeetingPointsSection.jsx'
import { PillarsSection } from './components/PillarsSection.jsx'
import { SafetyBannerSection } from './components/SafetyBannerSection.jsx'

export function HomeView({
  activityTypes,
  error,
  featuredActivities,
  isAuthenticated,
  loading,
  meetingPoints,
  retry,
  selectedType,
  setSelectedType,
}) {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false)

  return (
    <div className="bg-slate-50">
      {/* 1. Hero Section với nút AI Matchmaker ngay trung tâm dưới thanh Search */}
      <HeroSection
        activityTypes={activityTypes}
        onOpenAiMatchmaker={() => setIsAiModalOpen(true)}
      />

      {/* 2. Dải chuyển tiếp & Banner AI Matchmaker nổi bật ngay khi vừa lướt nhẹ */}
      <HighlightMarquee />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2 mb-4">
        <AiMatchmakerBanner onOpenModal={() => setIsAiModalOpen(true)} />
      </div>

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

      <SafetyBannerSection isAuthenticated={isAuthenticated} />

      {/* 3. Nút nổi AI Matchmaker cố định góc phải màn hình */}
      <AiMatchmakerFloatingButton onClick={() => setIsAiModalOpen(true)} />

      {/* Modal AI Matchmaker */}
      <AiMatchmakerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <SiteFooter />
    </div>
  )
}
