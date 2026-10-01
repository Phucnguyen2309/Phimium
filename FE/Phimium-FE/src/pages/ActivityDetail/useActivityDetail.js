import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import { ROUTES } from '@/routes/paths.js'
import activityService from '@/services/activityService.js'
import paymentService from '@/services/paymentService.js'
import pricingService from '@/services/pricingService.js'
import registrationService from '@/services/registrationService.js'
import { submitCheckoutForm } from '@/utils/checkout.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'

import {
  buildActivityDetail,
  estimatePrice,
  getGroupLimit,
  groupDeparturesByDate,
  mapQuote,
} from './activityDetailMapper.js'

const PICKUP_MAX = 500
const QUOTE_DELAY = 350

export function useActivityDetail() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { t } = useLanguage()

  const stateActivity = location.state?.activity ?? null

  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  // Đặt tour
  const [selectedDate, setSelectedDate] = useState('')
  const [departureId, setDepartureId] = useState(location.state?.departureId ?? '')
  const [adultCount, setAdultCount] = useState(1)
  const [childCount, setChildCount] = useState(0)
  const [pickupLocation, setPickupLocation] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [quote, setQuote] = useState(null)
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [showSafetyTerms, setShowSafetyTerms] = useState(false)
  const [safetyTermsAccepted, setSafetyTermsAccepted] = useState(false)
  const [booking, setBooking] = useState(false)

  useDocumentTitle(activity?.title || t('activityDetail.pageTitle'))

  useEffect(() => {
    if (!id) return undefined

    let isMounted = true

    Promise.all([
      activityService.getActivityById(id),
      activityService.getAllActivities().catch(() => null),
    ])
      .then(([detailResponse, listResponse]) => {
        if (isMounted) setActivity(buildActivityDetail(id, detailResponse, listResponse, stateActivity))
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
    // stateActivity chỉ dùng làm dữ liệu dự phòng lần đầu
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reloadKey])

  const retry = useCallback(() => {
    setLoading(true)
    setError(null)
    setReloadKey((current) => current + 1)
  }, [])

  const dateGroups = useMemo(() => (activity ? groupDeparturesByDate(activity) : []), [activity])
  const groupLimit = activity ? getGroupLimit(activity) : 0

  // Ngày đang chọn: theo lịch được truyền sang từ trang danh sách, không có thì ngày gần nhất
  const activeDate =
    selectedDate ||
    dateGroups.find((group) => group.departures.some((item) => item.id === departureId))?.date ||
    dateGroups[0]?.date ||
    ''
  const sessions = dateGroups.find((group) => group.date === activeDate)?.departures ?? []
  const selectedDeparture =
    sessions.find((item) => item.id === departureId && item.status !== 'FULL') ??
    sessions.find((item) => item.status !== 'FULL') ??
    null

  const totalGuests = adultCount + childCount
  const seatLimit = Math.min(
    ...[groupLimit, selectedDeparture?.capacity].filter((value) => Number(value) > 0),
  )
  const maxGuests = Number.isFinite(seatLimit) ? seatLimit : 0

  // Báo giá từ Backend (cần đăng nhập). Chưa đăng nhập thì tạm tính theo giá niêm yết.
  useEffect(() => {
    if (!isAuthenticated || !selectedDeparture) return undefined

    let isMounted = true
    const timer = setTimeout(() => {
      setQuoteLoading(true)

      pricingService
        .getQuote({
          departureId: selectedDeparture.id,
          adultCount,
          childCount,
          couponCode: couponCode || undefined,
        })
        .then((response) => {
          if (isMounted) setQuote(mapQuote(response))
        })
        .catch(() => {
          if (isMounted) setQuote(null)
        })
        .finally(() => {
          if (isMounted) setQuoteLoading(false)
        })
    }, QUOTE_DELAY)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [isAuthenticated, selectedDeparture, adultCount, childCount, couponCode])

  const price = (isAuthenticated && quote) || (activity ? estimatePrice(activity, adultCount, childCount) : null)

  const selectDate = (date) => {
    setSelectedDate(date)
    setDepartureId('')
    setBookingError('')
  }

  const selectDeparture = (value) => {
    setDepartureId(value)
    setBookingError('')
  }

  const changeGuests = (type, delta) => {
    setBookingError('')

    if (type === 'adult') {
      setAdultCount((current) => Math.max(1, current + delta))
    } else {
      setChildCount((current) => Math.max(0, current + delta))
    }
  }

  const applyCoupon = () => setCouponCode(couponInput.trim().toUpperCase())

  const clearCoupon = () => {
    setCouponInput('')
    setCouponCode('')
  }

  const goToLogin = () => navigate(ROUTES.login, { state: { from: location.pathname } })

  // Bước 1: kiểm tra form rồi mở điều khoản an toàn
  const startBooking = () => {
    if (!isAuthenticated) {
      goToLogin()
      return
    }

    if (!selectedDeparture) {
      setBookingError(t('activityDetail.booking.errors.noDeparture'))
      return
    }

    if (maxGuests && totalGuests > maxGuests) {
      setBookingError(t('activityDetail.booking.errors.tooManyGuests', { count: maxGuests }))
      return
    }

    if (!pickupLocation.trim()) {
      setBookingError(t('activityDetail.booking.errors.pickupRequired'))
      return
    }

    setBookingError('')
    setShowSafetyTerms(true)
  }

  // Bước 2: đã đồng ý điều khoản -> giữ chỗ -> chuyển sang thanh toán
  const confirmBooking = async () => {
    if (!safetyTermsAccepted) {
      setBookingError(t('activityDetail.mustAcceptTerms'))
      return
    }

    setBooking(true)
    setBookingError('')

    let registration = null

    try {
      const response = await registrationService.create({
        departureId: selectedDeparture.id,
        adultCount,
        childCount,
        isSafetyTermsAccepted: true,
        pickupLocation: pickupLocation.trim(),
        couponCode: couponCode || undefined,
      })

      registration = getResponseData(response)
    } catch (err) {
      setBookingError(getErrorMessage(err, t('activityDetail.joinFailed')))
      setShowSafetyTerms(false)
      setBooking(false)
      return
    }

    // Tour miễn phí hoặc đã được giảm hết -> không cần thanh toán
    if (!Number(registration?.totalAmount)) {
      navigate(ROUTES.userDashboard, { replace: true, state: { messageKey: 'activityDetail.booking.bookedFree' } })
      return
    }

    try {
      const payment = getResponseData(await paymentService.createPayment(registration.registrationId))

      if (payment?.checkoutUrl) {
        submitCheckoutForm(payment)
        return
      }
    } catch {
      // Không tạo được thanh toán: chỗ vẫn được giữ, khách thanh toán lại từ trang cá nhân
    }

    navigate(ROUTES.userDashboard, { replace: true, state: { messageKey: 'activityDetail.booking.bookedPayLater' } })
  }

  return {
    activeDate,
    activity,
    adultCount,
    applyCoupon,
    booking,
    bookingError,
    changeGuests,
    childCount,
    clearCoupon,
    closeSafetyTerms: () => {
      setShowSafetyTerms(false)
      setSafetyTermsAccepted(false)
    },
    confirmBooking,
    couponCode,
    couponInput,
    dateGroups,
    error,
    isAuthenticated,
    loading,
    maxGuests,
    pickupLocation,
    pickupMax: PICKUP_MAX,
    price,
    quote,
    quoteLoading,
    retry,
    safetyTermsAccepted,
    selectDate,
    selectDeparture,
    selectedDeparture,
    sessions,
    setCouponInput,
    setPickupLocation: (value) => {
      setPickupLocation(value.slice(0, PICKUP_MAX))
      setBookingError('')
    },
    setSafetyTermsAccepted,
    showSafetyTerms,
    startBooking,
    totalGuests,
  }
}
