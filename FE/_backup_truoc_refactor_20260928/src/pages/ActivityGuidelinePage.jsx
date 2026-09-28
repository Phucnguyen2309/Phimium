import { ActivityGuidelineView } from './ActivityGuideline/ActivityGuidelineView.jsx'
import { useActivityGuideline } from './ActivityGuideline/useActivityGuideline.js'

const ActivityGuidelinePage = () => {
  const activityGuideline = useActivityGuideline()

  return <ActivityGuidelineView {...activityGuideline} />
}

export default ActivityGuidelinePage
