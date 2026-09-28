import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import activityService from '@/services/activityService.js'
import { mapGroupDetail } from './groupDetailMapper.js'

export function useGroupDetail() {
  const { groupId } = useParams()

  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useDocumentTitle(group?.activityTitle ?? 'Group Detail')

  useEffect(() => {
    if (!groupId) return

    let isMounted = true

    const fetchGroupDetail = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await activityService.getGroupdetails(groupId)
        const mappedGroup = mapGroupDetail(response)

        if (isMounted) {
          setGroup(mappedGroup)
        }
      } catch (error) {
        console.error('Lỗi khi lấy group detail:', error)

        if (isMounted) {
          setError(error)
          setGroup(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchGroupDetail()

    return () => {
      isMounted = false
    }
  }, [groupId])

  return {
    group,
    loading,
    error,
  }
}