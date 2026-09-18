import { useParams } from 'react-router-dom'
import { ActivityBookingView } from './ActivityBookingView.jsx'

export default function ActivityBookingPage() {
  const { id } = useParams()

  return <ActivityBookingView activityId={id} />
}
