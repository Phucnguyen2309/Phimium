import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { ForbiddenView } from './Forbidden/ForbiddenView.jsx'

const ForbiddenPage = () => {
  useDocumentTitle('Không có quyền truy cập')

  return <ForbiddenView />
}

export default ForbiddenPage
