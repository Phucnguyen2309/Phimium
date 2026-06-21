import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import { ROUTES } from '@/routes/paths.js'
import activityService from '@/services/activityService.js'

import { getFallbackActivity } from './activityDetailData.js'

export function useActivityDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [activity, setActivity] = useState(() =>
    getFallbackActivity(id, location.state?.activity),
  )
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showSafetyTerms, setShowSafetyTerms] = useState(false)
  const [safetyTermsAccepted, setSafetyTermsAccepted] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')

  useDocumentTitle(activity?.title ? activity.title : 'Activity Detail')

  useEffect(() => {
    if (!id || !isAuthenticated) {
      return
    }

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await activityService.getActivityById(id)
        const detail = response?.data?.data ?? response?.data

        if (detail) {
          setActivity({
            ...getFallbackActivity(id, location.state?.activity),
            ...detail,
          })
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy chi tiết hoạt động:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id, isAuthenticated, location.state])

  const handleJoinActivity = async () => {
    if (!isAuthenticated) {
      setJoinMessage('Bạn cần đăng nhập trước khi tham gia hoạt động.')
      return
    }

    try {
      setJoining(true)
      setJoinMessage('')
      await activityService.joinActivity({
        activityId: id,
        isSafetyTermsAccepted: safetyTermsAccepted,
      })
      setShowSafetyTerms(false)
      setSafetyTermsAccepted(false)
      setJoinMessage('Đăng ký tham gia thành công.')
    } catch (error) {
      if (error?.response?.status !== 403) {
        console.error('Lỗi khi join activity:', error)
      }
      setJoinMessage(
        error?.response?.data?.message ?? 'Không thể tham gia hoạt động.',
      )
    } finally {
      setJoining(false)
    }
  }

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location.pathname } })
      return
    }

    setShowSafetyTerms(true)
  }

  return {
    activity,
    handleJoinActivity,
    handleJoinClick,
    id,
    joinMessage,
    joining,
    loading,
    safetyTermsAccepted,
    setSafetyTermsAccepted,
    setShowSafetyTerms,
    showSafetyTerms,
  }
}
