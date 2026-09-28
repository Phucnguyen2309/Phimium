import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { HomeView } from './HomeView.jsx'
import { useHome } from './useHome.js'

const HomePage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('home.pageTitle'))

  const { isAuthenticated } = useAuth()
  const home = useHome()

  return <HomeView {...home} isAuthenticated={isAuthenticated} />
}

export default HomePage
