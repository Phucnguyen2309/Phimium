import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { AdminView } from './Admin/AdminView.jsx'

const AdminPage = () => {
  useDocumentTitle('Admin')

  return <AdminView />
}

export default AdminPage
