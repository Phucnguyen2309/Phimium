import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { AdminView } from './AdminView.jsx'
import { useAdmin } from './useAdmin.js'

const AdminPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('admin.pageTitle'))

  const admin = useAdmin()

  return <AdminView {...admin} />
}

export default AdminPage