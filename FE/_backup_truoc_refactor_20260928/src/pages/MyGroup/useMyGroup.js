import { useEffect, useState } from 'react'

import activityService from '@/services/activityService.js'
import { mapMyGroupsResponse } from './myGroupsMapper.js'

export function useMyGroups() {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchMyGroups = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getMyGroups()
        const mappedGroups = mapMyGroupsResponse(response)

        if (isMounted) {
          setGroups(mappedGroups)
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách nhóm:', error)

        if (isMounted) {
          setError(error)
          setGroups([])
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchMyGroups()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    groups,
    loading,
    error,
  }
}