import { HeroSection } from "./components/HeroSection"
import { PopularActivitiesSection } from "./components/PopularActivitiesSection"
import { HomeCollections } from "./components/HomeCollections"
import { HomeLocalGuides } from "./components/HomeLocalGuides"

export function HomeView({ activities = [], loading = false }) {
  const activityList = Array.isArray(activities) ? activities : []

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      <HeroSection />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 space-y-16">
        <HomeCollections />

        <PopularActivitiesSection
          activities={activityList}
          loading={loading}
        />

        <HomeLocalGuides />
      </main>
    </div>
  )
}
