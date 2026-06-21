import { ActivityDetailView } from './ActivityDetail/ActivityDetailView.jsx'
import { useActivityDetail } from './ActivityDetail/useActivityDetail.js'

const ActivityDetailPage = () => {
  const activityDetail = useActivityDetail()

  return <ActivityDetailView {...activityDetail} />
}

export default ActivityDetailPage
