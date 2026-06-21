import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import activityService from '@/services/activityService.js'

import { getFallbackGuideline } from './guidelineData.js'

export function useActivityGuideline() {
  const { id } = useParams()
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const [guideline, setGuideline] = useState(() => getFallbackGuideline(id))
  const [loading, setLoading] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  useDocumentTitle('Guidelines')

  useEffect(() => {
    if (!id || !isAuthenticated) {
      return
    }

    const fetchGuideline = async () => {
      try {
        setLoading(true)
        const response = await activityService.getGuidelineByActivityId(id)
        const data = response?.data?.data ?? response?.data ?? response

        if (data) {
          setGuideline({ ...getFallbackGuideline(id), ...data })
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy guideline:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchGuideline()
  }, [id, isAuthenticated, location.state])

  return {
    acknowledged,
    guideline,
    id,
    loading,
    setAcknowledged,
  }
}
