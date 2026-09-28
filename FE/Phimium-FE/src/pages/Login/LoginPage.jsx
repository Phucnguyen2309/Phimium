import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { LoginView } from './LoginView.jsx'
import { useLogin } from './useLogin.js'

const LoginPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('auth.login.pageTitle'))

  const login = useLogin()

  return <LoginView {...login} />
}

export default LoginPage
