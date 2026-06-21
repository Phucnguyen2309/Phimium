import { CtaSection } from "./components/CtaSection"
import { HeroSection } from "./components/HeroSection"
import { HomeFooter } from "./components/HomeFooter"
import { HowItWorksSection } from "./components/HowItWorksSection"
import { PopularActivitiesSection } from "./components/PopularActivitiesSection"
import { TestimonialsSection } from "./components/TestimonialsSection"
import { WhyPhimiumSection } from "./components/WhyPhimiumSection"


export function HomeView({ activities = [], loading = false }) {
  const activityList = Array.isArray(activities) ? activities : []

  return (
    <div className="bg-slate-50">
      < HeroSection />

      <PopularActivitiesSection
        activities={activityList}
        loading={loading}
      />

      <HowItWorksSection />

      <WhyPhimiumSection />

      <TestimonialsSection />

      <CtaSection />

      <HomeFooter />
    </div>
  )
}