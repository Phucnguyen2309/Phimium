import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import { useAuth } from '@/context/authContext.js' 
import { BuddyView } from './Buddy/BuddyView.jsx'
import { useBuddy } from './Buddy/useBuddy.js'

const BuddyPage = () => {
  useDocumentTitle('Buddy Dashboard')

  // Lấy thông tin user từ Context
  const { user } = useAuth()

  // Lấy thẳng buddyId xịn sò từ user
  const buddyId = user?.buddyId || JSON.parse(localStorage.getItem('user'))?.buddyId;

  console.log("Buddy ID xịn từ BE:", buddyId);

  const { activities, feedbacks, loading, handleCreateActivity } = useBuddy(buddyId)

  return (
    <BuddyView 
      hostedActivities={activities} 
      feedbacks={feedbacks}
      loading={loading}
      handleCreateActivity={handleCreateActivity} 
    />
  )
}

export default BuddyPage