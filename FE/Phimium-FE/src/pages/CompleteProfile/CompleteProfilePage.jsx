import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { CompleteProfileView } from './CompleteProfileView.jsx'
import { useCompleteProfile } from './useCompleteProfile.js'

const CompleteProfilePage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('auth.completeProfile.pageTitle'))

  const completeProfile = useCompleteProfile()

  return <CompleteProfileView {...completeProfile} />
}

export default CompleteProfilePage
