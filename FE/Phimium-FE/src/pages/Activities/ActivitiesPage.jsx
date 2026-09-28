import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'

import { ActivitiesView } from './ActivitiesView.jsx'
import { useActivities } from './useActivities.js'

const ActivitiesPage = () => {
  const { t } = useLanguage()

  useDocumentTitle(t('activities.pageTitle'))

  const activities = useActivities()

  return <ActivitiesView {...activities} />
}

export default ActivitiesPage
