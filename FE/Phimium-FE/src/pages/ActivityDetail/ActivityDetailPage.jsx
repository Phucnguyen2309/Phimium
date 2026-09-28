import { ActivityDetailView } from './ActivityDetailView.jsx'
import { useActivityDetail } from './useActivityDetail.js'

const ActivityDetailPage = () => {
  const activityDetail = useActivityDetail()

  return <ActivityDetailView {...activityDetail} />
}

export default ActivityDetailPage
