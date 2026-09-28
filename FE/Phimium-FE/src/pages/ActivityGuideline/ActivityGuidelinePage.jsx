import { ActivityGuidelineView } from './ActivityGuidelineView.jsx'
import { useActivityGuideline } from './useActivityGuideline.js'

const ActivityGuidelinePage = () => {
  const activityGuideline = useActivityGuideline()

  return <ActivityGuidelineView {...activityGuideline} />
}

export default ActivityGuidelinePage
