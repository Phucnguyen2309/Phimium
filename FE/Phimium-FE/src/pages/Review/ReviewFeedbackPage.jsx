import { useParams } from 'react-router-dom'
import { ReviewFeedbackView } from './ReviewFeedbackView.jsx'

export default function ReviewFeedbackPage() {
  const { registrationId } = useParams()

  return <ReviewFeedbackView registrationId={registrationId} />
}
