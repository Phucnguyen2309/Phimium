import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { BuddyView } from './Buddy/BuddyView.jsx'

const BuddyPage = () => {
  useDocumentTitle('Buddy')

  return <BuddyView />
}

export default BuddyPage
