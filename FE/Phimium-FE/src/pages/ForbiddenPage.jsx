import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { ForbiddenView } from './Forbidden/ForbiddenView.jsx'

const ForbiddenPage = () => {
  useDocumentTitle('403')

  return <ForbiddenView />
}

export default ForbiddenPage
