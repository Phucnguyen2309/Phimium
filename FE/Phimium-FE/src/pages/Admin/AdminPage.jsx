import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { AdminView } from './AdminView.jsx'

const AdminPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('admin.pageTitle'))

  return <AdminView />
}

export default AdminPage
