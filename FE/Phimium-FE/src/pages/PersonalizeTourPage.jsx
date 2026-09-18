import { useParams } from 'react-router-dom'
import { PersonalizeTourView } from './PersonalizeTour/PersonalizeTourView.jsx'

const PersonalizeTourPage = () => {
  const { id } = useParams()
  return <PersonalizeTourView activityId={id} />
}

export default PersonalizeTourPage
