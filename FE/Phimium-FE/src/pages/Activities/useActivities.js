import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { mapActivitiesResponse } from '@/features/activity/activityMapper.js'
import activityService from '@/services/activityService.js'

import {
  ANY,
  DEFAULT_FILTERS,
  filterTours,
  getLocationOptions,
  getTypeOptions,
} from './toursFilter.js'

const ITEMS_PER_PAGE = 6

export function useActivities() {
  // Nhận bộ lọc ban đầu từ URL, VD: /activities?q=pho&type=FOODTOUR
  const [searchParams] = useSearchParams()

  const [activities, setActivities] = useState([])
  const [filters, setFilters] = useState(() => {
    const type = searchParams.get('type')

    return { ...DEFAULT_FILTERS, type: type && type !== 'ALL' ? type : ANY }
  })
  const [keyword, setKeyword] = useState(() => searchParams.get('q') || '')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let isMounted = true

    activityService
      .getAllActivities()
      .then((response) => {
        if (isMounted) setActivities(mapActivitiesResponse(response))
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err)
        setActivities([])
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [reloadKey])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((current) => current + 1)
  }, [])

  const typeOptions = useMemo(() => getTypeOptions(activities), [activities])
  const locationOptions = useMemo(() => getLocationOptions(activities), [activities])

  const filteredActivities = useMemo(
    () => filterTours(activities, filters, keyword),
    [activities, filters, keyword],
  )

  const totalPages = Math.max(Math.ceil(filteredActivities.length / ITEMS_PER_PAGE), 1)

  const paginatedActivities = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE
    return filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredActivities, page])

  const changeFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  const clearKeyword = () => {
    setKeyword('')
    setPage(1)
  }

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS)
    setKeyword('')
    setPage(1)
  }

  const hasActiveFilters =
    Boolean(keyword) || Object.keys(DEFAULT_FILTERS).some((key) => filters[key] !== ANY)

  return {
    activities,
    changeFilter,
    clearKeyword,
    error,
    filteredActivities,
    filters,
    hasActiveFilters,
    keyword,
    loading,
    locationOptions,
    page,
    paginatedActivities,
    resetFilters,
    retry,
    setPage,
    totalPages,
    typeOptions,
  }
}
