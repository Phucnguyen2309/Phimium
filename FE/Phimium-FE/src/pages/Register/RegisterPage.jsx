import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { RegisterView } from './RegisterView.jsx'
import { useRegister } from './useRegister.js'

const RegisterPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('auth.register.pageTitle'))

  const register = useRegister()

  return <RegisterView {...register} />
}

export default RegisterPage
