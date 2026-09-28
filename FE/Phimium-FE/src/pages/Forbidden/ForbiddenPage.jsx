import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { ForbiddenView } from './ForbiddenView.jsx'

const ForbiddenPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('errors.forbidden.pageTitle'))

  return <ForbiddenView />
}

export default ForbiddenPage
