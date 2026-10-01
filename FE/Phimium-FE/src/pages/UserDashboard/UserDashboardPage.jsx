import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { UserDashboardView } from './UserDashboardView.jsx'
import { useUserDashboard } from './useUserDashboard.js'

const UserDashboardPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('dashboard.pageTitle'))

  const dashboard = useUserDashboard()

  return <UserDashboardView {...dashboard} />
}

export default UserDashboardPage
