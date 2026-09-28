import { useEffect, useMemo, useState } from 'react'

import activityService from '@/services/activityService.js'
import { mapActivitiesResponse } from './myActivitiesMapper.js'

export function useMyActivities() {
  const [activities, setActivities] = useState([])
  const [activeTab, setActiveTab] = useState('ALL')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let ignore = false

    const fetchMyActivities = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getMyActivities()
        const mappedActivities = mapActivitiesResponse(response)

        if (!ignore) {
          setActivities(mappedActivities)
        }
      } catch (err) {
        console.error('Failed to fetch my activities:', err)

        if (!ignore) {
          setError(err)
          setActivities([])
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchMyActivities()

    return () => {
      ignore = true
    }
  }, [])

  const filteredActivities = useMemo(() => {
    if (activeTab === 'ALL') return activities

    return activities.filter((activity) => activity.status === activeTab)
  }, [activities, activeTab])

  return {
    activities,
    filteredActivities,
    activeTab,
    setActiveTab,
    loading,
    error,
  }
}