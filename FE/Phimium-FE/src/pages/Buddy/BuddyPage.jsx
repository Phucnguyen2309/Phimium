import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { BuddyView } from './BuddyView.jsx'
import { useBuddy } from './useBuddy.js'

const BuddyPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('buddy.pageTitle'))

  const { user } = useAuth()
  const buddy = useBuddy(user?.buddyId)

  return <BuddyView {...buddy} />
}

export default BuddyPage
