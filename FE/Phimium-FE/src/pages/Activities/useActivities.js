import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { mapActivitiesResponse } from '@/features/activity/activityMapper.js'
import activityService from '@/services/activityService.js'

const ITEMS_PER_PAGE = 6

export function useActivities() {
  // Nhận bộ lọc ban đầu từ URL, VD: /activities?q=gom&type=WORKSHOP
  const [searchParams] = useSearchParams()

  const [activities, setActivities] = useState([])
  const [selectedType, setSelectedType] = useState(
    () => searchParams.get('type') || 'ALL',
  )
  const [searchText, setSearchText] = useState(
    () => searchParams.get('q') || '',
  )
  const [page, setPage] = useState(1)
  const [viewMode, setViewMode] = useState('GRID')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchActivities = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getAllActivities()
        const mappedActivities = mapActivitiesResponse(response)

        if (isMounted) {
          setActivities(mappedActivities)
        }
      } catch (err) {
        console.error('Failed to fetch activities:', err)

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

  const activityTypes = useMemo(() => {
    const types = activities
      .map((activity) => activity.activityType)
      .filter(Boolean)

    return ['ALL', ...new Set(types)]
  }, [activities])

  const filteredActivities = useMemo(() => {
    const keyword = searchText.trim().toLowerCase()

    return activities.filter((activity) => {
      const matchType =
        selectedType === 'ALL' || activity.activityType === selectedType

      const matchSearch =
        !keyword ||
        activity.title.toLowerCase().includes(keyword) ||
        activity.description.toLowerCase().includes(keyword) ||
        activity.locationName.toLowerCase().includes(keyword) ||
        activity.address.toLowerCase().includes(keyword)

      return matchType && matchSearch
    })
  }, [activities, selectedType, searchText])

  const totalPages = Math.max(
    Math.ceil(filteredActivities.length / ITEMS_PER_PAGE),
    1,
  )

  const paginatedActivities = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    return filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredActivities, page])

  const changeSelectedType = (type) => {
    setSelectedType(type)
    setPage(1)
  }

  const changeSearchText = (value) => {
    setSearchText(value)
    setPage(1)
  }

  return {
    activities,
    activityTypes,
    filteredActivities,
    paginatedActivities,
    selectedType,
    setSelectedType: changeSelectedType,
    searchText,
    setSearchText: changeSearchText,
    page,
    setPage,
    totalPages,
    viewMode,
    setViewMode,
    loading,
    error,
  }
}