import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { VerifyEmailView } from './VerifyEmailView.jsx'
import { useVerifyEmail } from './useVerifyEmail.js'

const VerifyEmailPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('auth.verifyEmail.pageTitle'))

  const verifyEmail = useVerifyEmail()

  return <VerifyEmailView {...verifyEmail} />
}

export default VerifyEmailPage
