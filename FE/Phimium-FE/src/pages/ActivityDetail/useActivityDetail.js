import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import { ROUTES } from '@/routes/paths.js'
import activityService from '@/services/activityService.js'

export function useActivityDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()

  const [activity, setActivity] = useState(location.state?.activity ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [joining, setJoining] = useState(false)
  const [showSafetyTerms, setShowSafetyTerms] = useState(false)
  const [safetyTermsAccepted, setSafetyTermsAccepted] = useState(false)
  const [joinMessage, setJoinMessage] = useState('')

  useDocumentTitle(activity?.title || t('activityDetail.pageTitle'))

  useEffect(() => {
    if (!id) return

    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        setError(null)

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
          setError(error)
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
      setJoinMessage(t('activityDetail.mustAcceptTerms'))
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
          messageKey: 'dashboard.joinSuccess',
        },
      })
    } catch (error) {
      if (error?.response?.status !== 403) {
        console.error('Lỗi khi join activity:', error)
      }

      setJoinMessage(
        error?.response?.data?.message ?? t('activityDetail.joinFailed'),
      )
    } finally {
      setJoining(false)
    }
  }

  return {
    activity,
    error,
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