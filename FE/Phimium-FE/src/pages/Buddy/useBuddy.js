import { useEffect, useState } from 'react'
import buddyService from '@/services/buddyService.js'
import { mapActivitiesResponse } from '@/pages/Activity/ActivityMapper.js'

export const useBuddy = (buddyId) => { 
  const [data, setData] = useState({
    activities: [],
    feedbacks: [],
    loading: true
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!buddyId) return;

      try {
        setData(prev => ({ ...prev, loading: true }))

        // Thêm .catch() trực tiếp vào getFeedbackByBuddy để nó không nổ lây sang getHostedActivities
        const [activityRes, feedbackRes] = await Promise.all([
          buddyService.getHostedActivities(buddyId),
          buddyService.getFeedbackByBuddy(buddyId).catch(error => {
            console.warn('Bỏ qua lỗi tải Feedback:', error.message);
            // Trả về data rỗng giả để app chạy tiếp
            return { data: { data: [] } }; 
          })
        ])

        setData({
          activities: mapActivitiesResponse(activityRes),
          feedbacks: feedbackRes?.data?.data || [], 
          loading: false
        })
      } catch (error) {
        console.error('Lỗi tải dữ liệu Dashboard:', error)
        setData(prev => ({ ...prev, loading: false }))
      }
    }

    fetchData()
  }, [buddyId])

  return {
    ...data,
    handleCreateActivity: () => console.log('Mở form tạo...')
  }
}