import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import { ROUTES } from '@/routes/paths.js'
import activityService from '@/services/activityService.js'

export function useActivityDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [activity, setActivity] = useState(location.state?.activity ?? null)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const [showSafetyTerms, setShowSafetyTerms] = useState(false)
  const [safetyTermsAccepted, setSafetyTermsAccepted] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')

  useDocumentTitle(activity?.title ? activity.title : 'Chi tiết hoạt động')

  useEffect(() => {
    if (!id) return

    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)

        const response = await activityService.getActivityById(id)
        const detail = response?.data?.data ?? response?.data

        if (isMounted && detail) {
          setActivity(detail)
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy chi tiết hoạt động:', error)
        }

        if (isMounted) {
          setActivity(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleJoinClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location.pathname } })
      return
    }

    setJoinMessage('')
    setShowSafetyTerms(true)
  }

  const handleJoinActivity = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.login, { state: { from: location.pathname } })
      return
    }

    if (!safetyTermsAccepted) {
      setJoinMessage('Bạn cần đồng ý điều khoản an toàn trước khi tham gia.')
      return
    }

    try {
      setJoining(true)
      setJoinMessage('')

      await activityService.joinActivity({
        activityId: id,
        isSafetyTermsAccepted: true,
      })

      setShowSafetyTerms(false)
      setSafetyTermsAccepted(false)

      navigate(ROUTES.userDashboard, {
        replace: true,
        state: {
          activeTab: 'ACTIVITIES',
          message: 'Đăng ký tham gia thành công.',
        },
      })
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