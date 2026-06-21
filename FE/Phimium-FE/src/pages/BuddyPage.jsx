import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { BuddyView } from './Buddy/BuddyView.jsx'

const BuddyPage = () => {
  useDocumentTitle('Bảng điều khiển Buddy')

  return <BuddyView />
}

export default BuddyPage
