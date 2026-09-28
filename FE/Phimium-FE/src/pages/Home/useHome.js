import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { mapActivitiesResponse } from '@/features/activity/activityMapper.js'
import activityService from '@/services/activityService.js'

import {
  ALL_TYPES,
  getActivityTypes,
  getBuddiesFromActivities,
  getMeetingPoints,
} from './homeMapper.js'

const FEATURED_LIMIT = 4

export function useHome() {
  const location = useLocation()
  const [activities, setActivities] = useState([])
  const [selectedType, setSelectedType] = useState(ALL_TYPES)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getAllActivities()

        if (isMounted) {
          setActivities(mapActivitiesResponse(response))
        }
      } catch (err) {
        console.error('Failed to fetch home activities:', err)

        if (isMounted) {
          setError(err)
          setActivities([])
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

  // Link dạng /#popular-activities (menu header): cuộn tới section sau khi tải xong
  useEffect(() => {
    if (loading || !location.hash) return

    document
      .getElementById(location.hash.slice(1))
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading, location.hash])

  const activityTypes = useMemo(() => getActivityTypes(activities), [activities])

  const featuredActivities = useMemo(() => {
    const list =
      selectedType === ALL_TYPES
        ? activities
        : activities.filter((activity) => activity.activityType === selectedType)

    return list.slice(0, FEATURED_LIMIT)
  }, [activities, selectedType])

  const buddies = useMemo(() => getBuddiesFromActivities(activities), [activities])

  const meetingPoints = useMemo(() => getMeetingPoints(activities), [activities])

  return {
    activityTypes,
    buddies,
    error,
    featuredActivities,
    loading,
    meetingPoints,
    selectedType,
    setSelectedType,
  }
}
