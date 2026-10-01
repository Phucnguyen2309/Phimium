import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { mapMyGroupsResponse } from '@/features/myGroups/myGroupsMapper.js'
import activityService from '@/services/activityService.js'
import feedbackService from '@/services/feedbackService.js'
import groupService from '@/services/groupService.js'
import paymentService from '@/services/paymentService.js'
import registrationService from '@/services/registrationService.js'
import { submitCheckoutForm } from '@/utils/checkout.js'
import { getResponseData, getResponseList } from '@/utils/response.js'

import {
  buildJourneys,
  canReview,
  getJourneyGroup,
  getJourneyStats,
  JOURNEY_FILTER,
  mapFeedback,
  mapPayment,
  mergeRegistration,
  sortJourneys,
} from './userDashboardMapper.js'

// Lấy message lỗi Backend (ApiResponse.message) nếu có
const getApiMessage = (error, fallback) => error?.response?.data?.message || fallback

// Gọi API phụ: lỗi thì trả về rỗng để phần chính vẫn hiển thị
const optional = (request) => request.catch(() => null)

export function useUserDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const location = useLocation()

  const [journeys, setJourneys] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [payments, setPayments] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [filter, setFilter] = useState(JOURNEY_FILTER.all)

  // Thao tác trên từng chuyến: { [registrationId]: 'checkIn' | 'cancel' }
  const [pendingActions, setPendingActions] = useState({})
  const [actionMessage, setActionMessage] = useState(null)

  // Đánh giá: { journey, initialRating } | null
  const [reviewTarget, setReviewTarget] = useState(null)

  useEffect(() => {
    let isMounted = true

    Promise.all([
      registrationService.getMyRegistrations(),
      optional(activityService.getMyActivities()),
      optional(feedbackService.getMyFeedbacks()),
      optional(paymentService.getMyPayments()),
      optional(groupService.getMyGroups()),
    ])
      .then(([registrations, joined, feedbackResponse, paymentResponse, groupResponse]) => {
        if (!isMounted) return

        const mappedFeedbacks = getResponseList(feedbackResponse).map(mapFeedback)

        setFeedbacks(mappedFeedbacks)
        setJourneys(buildJourneys(registrations, joined, mappedFeedbacks))
        setPayments(
          getResponseList(paymentResponse)
            .map(mapPayment)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
        )
        setGroups(groupResponse ? mapMyGroupsResponse(groupResponse) : [])
      })
      .catch((err) => {
        if (isMounted) setError(err)
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

  const sortedJourneys = useMemo(() => sortJourneys(journeys), [journeys])

  const filterCounts = useMemo(() => {
    const counts = { [JOURNEY_FILTER.all]: journeys.length }

    journeys.forEach((journey) => {
      const group = getJourneyGroup(journey)
      counts[group] = (counts[group] ?? 0) + 1
    })

    return counts
  }, [journeys])

  const visibleJourneys = useMemo(
    () =>
      filter === JOURNEY_FILTER.all
        ? sortedJourneys
        : sortedJourneys.filter((journey) => getJourneyGroup(journey) === filter),
    [filter, sortedJourneys],
  )

  const stats = useMemo(() => getJourneyStats(journeys, feedbacks), [journeys, feedbacks])

  // Chuyến gần nhất đang chờ đánh giá -> banner vàng
  const pendingReview = useMemo(
    () => sortedJourneys.filter((journey) => canReview(journey)).sort((a, b) => b.start - a.start)[0] ?? null,
    [sortedJourneys],
  )

  const runAction = async (journey, action, request, successKey) => {
    setPendingActions((current) => ({ ...current, [journey.id]: action }))
    setActionMessage(null)

    try {
      const response = await request(journey.id)

      setJourneys((current) =>
        current.map((item) => (item.id === journey.id ? mergeRegistration(item, response) : item)),
      )
      setActionMessage({ tone: 'success', text: t(successKey, { title: journey.title }) })
    } catch (err) {
      setActionMessage({
        tone: 'error',
        text: getApiMessage(err, t(`userDashboard.actions.${action}Failed`)),
      })
    } finally {
      setPendingActions((current) => {
        const next = { ...current }
        delete next[journey.id]
        return next
      })
    }
  }

  const checkIn = (journey) =>
    runAction(journey, 'checkIn', registrationService.checkIn, 'userDashboard.actions.checkInSuccess')

  const cancel = (journey) =>
    runAction(journey, 'cancel', registrationService.cancel, 'userDashboard.actions.cancelSuccess')

  // Thanh toán lại cho chuyến đang chờ thanh toán -> chuyển sang cổng SePay
  const payNow = async (journey) => {
    setPendingActions((current) => ({ ...current, [journey.id]: 'pay' }))
    setActionMessage(null)

    try {
      const payment = getResponseData(await paymentService.createPayment(journey.id))

      if (payment?.checkoutUrl) {
        submitCheckoutForm(payment)
        return
      }

      throw new Error('missing checkoutUrl')
    } catch (err) {
      setActionMessage({ tone: 'error', text: getApiMessage(err, t('userDashboard.actions.payFailed')) })
      setPendingActions((current) => {
        const next = { ...current }
        delete next[journey.id]
        return next
      })
    }
  }

  const openReview = (journey, initialRating = 0) => setReviewTarget({ journey, initialRating })
  const closeReview = () => setReviewTarget(null)

  /** Gửi đánh giá. Trả về message lỗi (string) hoặc null khi thành công */
  const submitReview = async (payload) => {
    const journey = reviewTarget?.journey
    if (!journey) return null

    try {
      const response = await feedbackService.createFeedback(journey.id, payload)
      const created = mapFeedback(response?.data?.data ?? response?.data ?? {})
      const feedback = { ...created, registrationId: created.registrationId || journey.id }

      setFeedbacks((current) => [feedback, ...current])
      setJourneys((current) =>
        current.map((item) => (item.id === journey.id ? { ...item, feedback } : item)),
      )
      setReviewTarget(null)
      setActionMessage({ tone: 'success', text: t('userDashboard.review.success') })

      return null
    } catch (err) {
      return getApiMessage(err, t('userDashboard.review.failed'))
    }
  }

  return {
    actionMessage,
    cancel,
    checkIn,
    closeReview,
    error,
    filter,
    filterCounts,
    groups,
    loading,
    openReview,
    payNow,
    payments,
    pendingActions,
    pendingReview,
    retry,
    reviewTarget,
    setFilter,
    stats,
    submitReview,
    successMessageKey: location.state?.messageKey ?? '',
    user,
    visibleJourneys,
  }
}
