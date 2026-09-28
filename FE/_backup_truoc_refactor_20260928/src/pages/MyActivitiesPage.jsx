import { MyActivitiesView } from './MyActivities/MyActivitiesView.jsx'
import { useMyActivities } from './MyActivities/useMyActivities.js'

const MyActivitiesPage = () => {
  const myActivities = useMyActivities()

  return <MyActivitiesView {...myActivities} />
}

export default MyActivitiesPage
