import { useEffect, useState } from 'react'

import activityService from '@/services/activityService.js'

import { fallbackActivities, getResponseList } from './homeMapper.js'

export function useHome() {
  const [activities, setActivities] = useState(fallbackActivities)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getAllActivities()
        const list = getResponseList(response)

        if (isMounted) {
          setActivities(list)
        }
      } catch (err) {
        console.error('Failed to fetch home activities:', err)

        if (isMounted) {
          setError(err)
          setActivities(fallbackActivities)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchActivities()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    activities,
    loading,
    error,
  }
}