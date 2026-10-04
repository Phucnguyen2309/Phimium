import { useCallback, useEffect, useMemo, useState } from 'react'

import buddyService from '@/services/buddyService.js'
import { getErrorMessage, getResponseData, getResponseList } from '@/utils/response.js'

/* ── Phân loại ca tour theo thời gian thực tế ── */
const classifyDeparture = (dep) => {
  const now = new Date()
  const dStr = dep.departureDate
  const tStart = dep.startTime || '00:00'
  const tEnd = dep.endTime || '23:59'
  const start = new Date(`${dStr}T${tStart}`)
  const end = new Date(`${dStr}T${tEnd}`)
  if (now >= start && now <= end) return 'IN_PROGRESS'
  if (now > end) return 'COMPLETED'
  return 'UPCOMING'
}

const enrichSchedule = (raw) => {
  const status = classifyDeparture(raw)
  return {
    ...raw,
    status,
    totalGuests: Number(raw.totalGuests) || Number(raw.currentParticipants) || 0,
    checkedInCount: Number(raw.checkedInCount) || 0,
  }
}

const computeStats = (schedules, feedbacks) => {
  const upcoming = schedules.filter((s) => s.status === 'UPCOMING').length
  const inProgress = schedules.filter((s) => s.status === 'IN_PROGRESS').length
  const completed = schedules.filter((s) => s.status === 'COMPLETED').length
  const totalGuests = schedules.reduce((sum, s) => sum + (s.totalGuests || 0), 0)

  const ratings = feedbacks
    .map((f) => Number(f.buddyRating))
    .filter((r) => !isNaN(r) && r > 0)

  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : '5.0'

  return {
    upcomingTours: upcoming,
    inProgressTours: inProgress,
    completedTours: completed,
    totalTours: schedules.length,
    totalGuests,
    avgRating,
    reviewCount: feedbacks.length,
  }
}

export function useBuddy(user) {
  const buddyId = user?.buddyId

  const [activeTab, setActiveTab] = useState('SCHEDULES') // 'SCHEDULES' | 'REVIEWS'
  const [scheduleFilter, setScheduleFilter] = useState('ALL') // 'ALL' | 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED'

  const [buddyStatus, setBuddyStatus] = useState('ACTIVE')
  const [statusLoading, setStatusLoading] = useState(false)
  const [statusError, setStatusError] = useState(null)

  const [allSchedules, setAllSchedules] = useState([])
  const [feedbacks, setFeedbacks] = useState([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  // Members modal
  const [selectedDeparture, setSelectedDeparture] = useState(null)
  const [members, setMembers] = useState([])
  const [loadingMembers, setLoadingMembers] = useState(false)
  const [membersError, setMembersError] = useState(null)

  /* ── Tải toàn bộ dữ liệu ── */
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      setError(null)

      const promises = [
        buddyService.getMySchedules().catch((err) => {
          console.warn('Lỗi lấy lịch dẫn tour:', err?.message)
          return null
        }),
      ]

      if (buddyId) {
        promises.push(
          buddyService.getFeedbackByBuddy(buddyId).catch((err) => {
            console.warn('Lỗi lấy feedback:', err?.message)
            return null
          }),
        )
      }

      const [schedRes, fbRes] = await Promise.all(promises)

      if (schedRes) {
        const raw = getResponseList(schedRes)
        setAllSchedules(raw.map(enrichSchedule))
      }

      if (fbRes) {
        setFeedbacks(getResponseList(fbRes))
      }
    } catch (err) {
      console.error('Buddy fetch error:', err)
      setError(err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [buddyId])

  useEffect(() => {
    fetchData(false)
  }, [fetchData])

  /* ── Lọc danh sách ca tour ── */
  const schedules = useMemo(() => {
    if (scheduleFilter === 'ALL') return allSchedules
    return allSchedules.filter((s) => s.status === scheduleFilter)
  }, [allSchedules, scheduleFilter])

  /* ── Thống kê chỉ số ── */
  const stats = useMemo(() => computeStats(allSchedules, feedbacks), [allSchedules, feedbacks])

  /* ── Bật/Tắt trạng thái nhận ca ── */
  const handleToggleStatus = useCallback(async () => {
    const nextStatus = buddyStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    setStatusLoading(true)
    setStatusError(null)

    try {
      const res = await buddyService.updateMyStatus(nextStatus)
      const data = getResponseData(res)
      setBuddyStatus(data?.status || nextStatus)
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái Buddy:', err)
      const msg = getErrorMessage(
        err,
        'Không thể cập nhật trạng thái. Vui lòng kiểm tra lại.',
      )
      setStatusError(msg)
      setTimeout(() => setStatusError(null), 5000)
    } finally {
      setStatusLoading(false)
    }
  }, [buddyStatus])

  /* ── Xem danh sách khách đoàn ── */
  const openMembersModal = useCallback(async (departure) => {
    setSelectedDeparture(departure)
    setMembers([])
    setMembersError(null)
    setLoadingMembers(true)
    try {
      const res = await buddyService.getTourMembers(departure.departureId)
      setMembers(getResponseList(res))
    } catch (err) {
      setMembersError(getErrorMessage(err, 'Lỗi tải danh sách khách'))
    } finally {
      setLoadingMembers(false)
    }
  }, [])

  const closeMembersModal = useCallback(() => {
    setSelectedDeparture(null)
    setMembers([])
  }, [])

  const refreshMembers = useCallback(async () => {
    if (!selectedDeparture) return
    setLoadingMembers(true)
    try {
      const res = await buddyService.getTourMembers(selectedDeparture.departureId)
      setMembers(getResponseList(res))
    } catch (err) {
      setMembersError(getErrorMessage(err, 'Lỗi làm mới danh sách khách'))
    } finally {
      setLoadingMembers(false)
    }
  }, [selectedDeparture])

  /* ── Điểm danh / Đón khách ── */
  const handleCheckInMember = useCallback(
    async (registrationId) => {
      if (!selectedDeparture) return
      try {
        const res = await buddyService.checkInMember(selectedDeparture.departureId, registrationId)
        const updated = getResponseData(res)
        setMembers((prev) =>
          prev.map((m) =>
            m.registrationId === registrationId
              ? {
                  ...m,
                  checkInStatus: updated?.checkInStatus || (m.checkInStatus === 'PRESENT' ? 'NOT_YET' : 'PRESENT'),
                  checkedInAt: updated?.checkedInAt || (m.checkInStatus === 'PRESENT' ? null : new Date().toISOString()),
                }
              : m,
          ),
        )
        // Cập nhật lại số lượng checkedInCount trong allSchedules
        setAllSchedules((prev) =>
          prev.map((s) => {
            if (s.departureId === selectedDeparture.departureId) {
              const isNowPresent = updated?.checkInStatus === 'PRESENT'
              return {
                ...s,
                checkedInCount: Math.max(0, (s.checkedInCount || 0) + (isNowPresent ? 1 : -1)),
              }
            }
            return s
          }),
        )
      } catch (err) {
        throw err
      }
    },
    [selectedDeparture],
  )

  return {
    activeTab,
    setActiveTab,
    scheduleFilter,
    setScheduleFilter,

    buddyStatus,
    statusLoading,
    statusError,
    handleToggleStatus,

    schedules,
    allSchedules,
    feedbacks,
    stats,

    loading,
    refreshing,
    error,
    refreshDashboard: () => fetchData(true),

    selectedDeparture,
    members,
    loadingMembers,
    membersError,
    openMembersModal,
    closeMembersModal,
    refreshMembers,
    handleCheckInMember,

    hasBuddyId: Boolean(buddyId),
  }
}
