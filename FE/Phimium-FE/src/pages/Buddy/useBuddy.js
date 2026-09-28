import { useEffect, useState } from 'react'

import { mapActivitiesResponse } from '@/features/activity/activityMapper.js'
import buddyService from '@/services/buddyService.js'
import { getResponseList } from '@/utils/response.js'

export function useBuddy(buddyId) {
  const [hostedActivities, setHostedActivities] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(Boolean(buddyId))
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!buddyId) return

    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Lỗi feedback không được làm hỏng danh sách hoạt động
        const [activityRes, feedbackRes] = await Promise.all([
          buddyService.getHostedActivities(buddyId),
          buddyService.getFeedbackByBuddy(buddyId).catch((err) => {
            console.warn('Không tải được feedback:', err?.message)
            return null
          }),
        ])

        if (isMounted) {
          setHostedActivities(mapActivitiesResponse(activityRes))
          setFeedbacks(getResponseList(feedbackRes))
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu Buddy dashboard:', err)

        if (isMounted) {
          setError(err)
          setHostedActivities([])
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
  }, [buddyId])

  // TODO: mở form tạo hoạt động khi BE có API
  const handleCreateActivity = () => {}

  return {
    hostedActivities,
    feedbacks,
    loading,
    error,
    hasBuddyId: Boolean(buddyId),
    handleCreateActivity,
  }
}
