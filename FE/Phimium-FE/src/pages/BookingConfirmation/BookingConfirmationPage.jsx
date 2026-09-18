import { useParams } from 'react-router-dom'
import { BookingConfirmationView } from './BookingConfirmationView.jsx'

export default function BookingConfirmationPage() {
  const { registrationId } = useParams()

  return <BookingConfirmationView registrationId={registrationId} />
}
