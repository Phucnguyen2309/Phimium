import { useAuth } from '@/context/authContext.js'

import { GroupDetailView } from './GroupDetailView.jsx'
import { useGroupDetail } from './useGroupDetail.js'

const GroupDetailPage = () => {
  const { user } = useAuth()
  const groupDetail = useGroupDetail()

  return <GroupDetailView {...groupDetail} currentUserId={user?.userId} />
}

export default GroupDetailPage
