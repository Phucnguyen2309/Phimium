import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import activityService from '@/services/activityService.js'
import { getResponseData } from '@/utils/response.js'

export function useActivityGuideline() {
  const { id } = useParams()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()

  const [guideline, setGuideline] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [acknowledged, setAcknowledged] = useState(false)

  useDocumentTitle(t('guideline.pageTitle'))

  useEffect(() => {
    if (!id || !isAuthenticated) return

    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [guidelineRes, activityRes] = await Promise.allSettled([
          activityService.getGuidelineByActivityId(id),
          activityService.getActivityById(id),
        ])

        if (isMounted) {
          if (guidelineRes.status === 'fulfilled') {
            setGuideline(getResponseData(guidelineRes.value))
          }
          if (activityRes.status === 'fulfilled') {
            const detail = activityRes.value?.data?.data ?? activityRes.value?.data
            setActivity(detail)
          }
        }
      } catch (err) {
        if (err?.response?.status !== 403) {
          console.error('Lỗi khi lấy guideline:', err)
        }

        if (isMounted) {
          setError(err)
          setGuideline(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [id, isAuthenticated])

  return {
    acknowledged,
    activity,
    error,
    guideline,
    id,
    isAuthenticated,
    loading,
    setAcknowledged,
  }
}
