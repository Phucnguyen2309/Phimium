import { useEffect, useState } from 'react'

import { ADMIN_TABS } from '@/constants/admin.js'
import activityService from '@/services/activityService.js'
import adminService from '@/services/adminService.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'
import { useLanguage } from '@/context/languageContext.js'

import {
  mapAdminActivitiesResponse,
  mapAdminBookingsResponse,
  mapAdminBuddiesResponse,
  mapAdminCouponsResponse,
  mapAdminFeedbacksResponse,
  mapAdminPaymentsResponse,
  mapAdminUsersResponse,
  mapDashboardStats,
} from './adminMapper.js'

const getInitialAdminTab = () => {
  try {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    if (tabParam && Object.values(ADMIN_TABS).includes(tabParam)) {
      return tabParam
    }
    const saved = sessionStorage.getItem('admin_active_tab')
    if (saved && Object.values(ADMIN_TABS).includes(saved)) {
      return saved
    }
  } catch {
    // ignore
  }
  return ADMIN_TABS.overview
}

export function useAdmin() {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [activeTab, setActiveTab] = useState(getInitialAdminTab)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Toast notification state
  const [toast, setToast] = useState(null)
  const showToast = (toastObj) => setToast({ id: Date.now(), ...toastObj })
  const hideToast = () => setToast(null)

  // Dữ liệu domain
  const [dashboardData, setDashboardData] = useState(null)
  const [activities, setActivities] = useState([])
  const [bookings, setBookings] = useState([])
  const [buddies, setBuddies] = useState([])
  const [users, setUsers] = useState([])
  const [coupons, setCoupons] = useState([])
  const [payments, setPayments] = useState([])
  const [feedbacks, setFeedbacks] = useState([])

  // Modal states
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState(null)
  const [assignBuddyModal, setAssignBuddyModal] = useState({
    isOpen: false,
    registrationId: null,
    candidates: [],
    loading: false,
  })

  // 1. Phân trang & bộ lọc Users (Server-side)
  const [userFilters, setUserFilters] = useState({
    page: 0,
    size: 10,
    keyword: '',
    role: '',
    status: '',
  })
  const [userPagination, setUserPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0,
  })

  // 2. Phân trang & bộ lọc Payments (Server-side)
  const [paymentFilters, setPaymentFilters] = useState({
    page: 0,
    size: 10,
    keyword: '',
    status: '',
  })
  const [paymentPagination, setPaymentPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0,
  })

  // 3. Phân trang & bộ lọc Feedbacks (Server-side)
  const [feedbackFilters, setFeedbackFilters] = useState({
    page: 0,
    size: 10,
    keyword: '',
    tourRating: '',
    buddyRating: '',
  })
  const [feedbackPagination, setFeedbackPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0,
  })

  // 4. Phân trang & bộ lọc Bookings (Server-side)
  const [bookingFilters, setBookingFilters] = useState({
    page: 0,
    size: 10,
    status: '',
    activityId: '',
    keyword: '',
  })
  const [bookingPagination, setBookingPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 1,
    totalElements: 0,
  })

  // 5. Bộ lọc Buddies (Client/Server status)
  const [buddyFilters, setBuddyFilters] = useState({
    status: '',
    keyword: '',
  })

  // Đổi tab từ UI
  const handleSelectTab = (tab) => {
    if (tab !== activeTab) {
      setLoading(true)
      setActiveTab(tab)
      try {
        sessionStorage.setItem('admin_active_tab', tab)
        const url = new URL(window.location.href)
        url.searchParams.set('tab', tab)
        window.history.replaceState({}, '', url.toString())
      } catch {
        // ignore
      }
    }
  }

  // Đồng bộ URL và sessionStorage khi activeTab thay đổi, hỗ trợ nút Back / Forward
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      if (url.searchParams.get('tab') !== activeTab) {
        url.searchParams.set('tab', activeTab)
        window.history.replaceState({}, '', url.toString())
      }
      sessionStorage.setItem('admin_active_tab', activeTab)
    } catch {
      // ignore
    }
  }, [activeTab])

  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search)
        const tabParam = params.get('tab')
        if (tabParam && Object.values(ADMIN_TABS).includes(tabParam) && tabParam !== activeTab) {
          setLoading(true)
          setActiveTab(tabParam)
        }
      } catch {
        // ignore
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [activeTab])

  // Refresh lại tab hiện tại
  const refreshCurrentTab = () => {
    setLoading(true)
    setRefreshKey((prev) => prev + 1)
  }

  // Fetch data
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        if (activeTab === ADMIN_TABS.overview) {
          const [summaryRes, departuresRes, registrationsRes] = await Promise.all([
            adminService.getDashboardSummary().catch(() => null),
            adminService.getDepartures().catch(() => null),
            adminService.getRegistrations({ size: 10 }).catch(() => null),
          ])
          if (isMounted) {
            const mappedSummary = mapDashboardStats(summaryRes)
            const mappedBookings = mapAdminBookingsResponse(registrationsRes)
            if (mappedBookings && mappedBookings.length > 0) {
              mappedSummary.recentRegistrations = mappedBookings.slice(0, 6)
            }
            setDashboardData(mappedSummary)
            if (departuresRes) {
              setActivities(mapAdminActivitiesResponse(departuresRes))
            }
          }
        } else if (activeTab === ADMIN_TABS.activities) {
          const [activitiesRes, departuresRes] = await Promise.all([
            activityService.getAllActivities().catch(() => null),
            adminService.getDepartures({ size: 100 }).catch(() => null),
          ])
          if (isMounted) {
            const mappedActivities = mapAdminActivitiesResponse(activitiesRes)
            const mappedDepartures = mapAdminActivitiesResponse(departuresRes)
            if (mappedActivities && mappedActivities.length > 0) {
              const rawDepList =
                departuresRes?.data?.data?.content ??
                departuresRes?.data?.content ??
                (Array.isArray(departuresRes?.data?.data) ? departuresRes.data.data : [])
              const depMap = new Map()
              if (Array.isArray(rawDepList)) {
                rawDepList.forEach((d) => {
                  if (d?.departureId) {
                    depMap.set(String(d.departureId), {
                      departureDate: d.departureDate ?? d.date ?? '',
                      totalCapacity: Number(d.totalCapacity ?? d.capacity ?? 0),
                      remainingSeats: Number(d.remainingSeats ?? d.capacity ?? 0),
                      reservedGuests: Number(d.reservedGuests ?? 0),
                    })
                  }
                })
              }

              const enrichedActivities = mappedActivities.map((act) => ({
                ...act,
                departures: (act.departures || []).map((dep) => {
                  const details = depMap.get(String(dep.departureId))
                  if (details) {
                    return {
                      ...dep,
                      departureDate: details.departureDate || dep.departureDate || '',
                      totalCapacity: details.totalCapacity,
                      remainingSeats: details.remainingSeats,
                      reservedGuests: details.reservedGuests,
                    }
                  }
                  return dep
                }),
              }))
              setActivities(enrichedActivities)
            } else {
              setActivities(mappedDepartures)
            }
          }
        } else if (activeTab === ADMIN_TABS.bookings) {
          const params = {
            page: bookingFilters.page,
            size: bookingFilters.size,
            ...(bookingFilters.status ? { status: bookingFilters.status } : {}),
            ...(bookingFilters.activityId ? { activityId: bookingFilters.activityId } : {}),
          }
          const res = await adminService.getRegistrations(params)
          if (isMounted) {
            const pageData = res?.data?.data ?? res?.data ?? res
            const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : [])
            setBookings(mapAdminBookingsResponse(content))
            setBookingPagination({
              page: pageData?.number ?? bookingFilters.page,
              size: pageData?.size ?? bookingFilters.size,
              totalPages: pageData?.totalPages ?? 1,
              totalElements: pageData?.totalElements ?? content.length,
            })
          }
        } else if (activeTab === ADMIN_TABS.buddies) {
          const params = {
            ...(buddyFilters.status ? { status: buddyFilters.status } : {}),
          }
          const res = await adminService.getBuddies(params)
          if (isMounted) setBuddies(mapAdminBuddiesResponse(res))
        } else if (activeTab === ADMIN_TABS.users) {
          const params = {
            page: userFilters.page,
            size: userFilters.size,
            ...(userFilters.keyword ? { keyword: userFilters.keyword.trim() } : {}),
            ...(userFilters.role ? { role: userFilters.role } : {}),
            ...(userFilters.status ? { status: userFilters.status } : {}),
          }
          const res = await adminService.getUsers(params)
          if (isMounted) {
            const pageData = res?.data?.data ?? res?.data ?? res
            const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : [])
            setUsers(mapAdminUsersResponse(content))
            setUserPagination({
              page: pageData?.number ?? userFilters.page,
              size: pageData?.size ?? userFilters.size,
              totalPages: pageData?.totalPages ?? 1,
              totalElements: pageData?.totalElements ?? content.length,
            })
          }
        } else if (activeTab === ADMIN_TABS.coupons) {
          const res = await adminService.getCoupons()
          if (isMounted) setCoupons(mapAdminCouponsResponse(res))
        } else if (activeTab === ADMIN_TABS.payments) {
          const params = {
            page: paymentFilters.page,
            size: paymentFilters.size,
            ...(paymentFilters.keyword ? { keyword: paymentFilters.keyword.trim() } : {}),
            ...(paymentFilters.status ? { status: paymentFilters.status } : {}),
          }
          const res = await adminService.getPayments(params)
          if (isMounted) {
            const pageData = res?.data?.data ?? res?.data ?? res
            const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : [])
            setPayments(mapAdminPaymentsResponse(content))
            setPaymentPagination({
              page: pageData?.number ?? paymentFilters.page,
              size: pageData?.size ?? paymentFilters.size,
              totalPages: pageData?.totalPages ?? 1,
              totalElements: pageData?.totalElements ?? content.length,
            })
          }
        } else if (activeTab === ADMIN_TABS.feedbacks) {
          const params = {
            page: feedbackFilters.page,
            size: feedbackFilters.size,
            ...(feedbackFilters.keyword ? { keyword: feedbackFilters.keyword.trim() } : {}),
            ...(feedbackFilters.tourRating ? { tourRating: Number(feedbackFilters.tourRating) } : {}),
            ...(feedbackFilters.buddyRating ? { buddyRating: Number(feedbackFilters.buddyRating) } : {}),
          }
          const res = await adminService.getFeedbacks(params)
          if (isMounted) {
            const pageData = res?.data?.data ?? res?.data ?? res
            const content = pageData?.content ?? (Array.isArray(pageData) ? pageData : [])
            setFeedbacks(mapAdminFeedbacksResponse(content))
            setFeedbackPagination({
              page: pageData?.number ?? feedbackFilters.page,
              size: pageData?.size ?? feedbackFilters.size,
              totalPages: pageData?.totalPages ?? 1,
              totalElements: pageData?.totalElements ?? content.length,
            })
          }
        }

        if (isMounted) {
          setError(null)
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu trang Admin:', err)
        if (isMounted) {
          setError(err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      isMounted = false
    }
  }, [
    activeTab,
    refreshKey,
    language,
    userFilters.page,
    userFilters.size,
    userFilters.keyword,
    userFilters.role,
    userFilters.status,
    paymentFilters.page,
    paymentFilters.size,
    paymentFilters.keyword,
    paymentFilters.status,
    feedbackFilters.page,
    feedbackFilters.size,
    feedbackFilters.keyword,
    feedbackFilters.tourRating,
    feedbackFilters.buddyRating,
    bookingFilters.page,
    bookingFilters.size,
    bookingFilters.status,
    bookingFilters.activityId,
    buddyFilters.status,
  ])

  // Pagination & Filter Handlers
  const handleUserPageChange = (page) => setUserFilters((prev) => ({ ...prev, page }))
  const handleUserSizeChange = (size) => setUserFilters((prev) => ({ ...prev, size, page: 0 }))
  const handleUserFiltersChange = (newFilters) => setUserFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))

  const handlePaymentPageChange = (page) => setPaymentFilters((prev) => ({ ...prev, page }))
  const handlePaymentSizeChange = (size) => setPaymentFilters((prev) => ({ ...prev, size, page: 0 }))
  const handlePaymentFiltersChange = (newFilters) => setPaymentFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))

  const handleFeedbackPageChange = (page) => setFeedbackFilters((prev) => ({ ...prev, page }))
  const handleFeedbackSizeChange = (size) => setFeedbackFilters((prev) => ({ ...prev, size, page: 0 }))
  const handleFeedbackFiltersChange = (newFilters) => setFeedbackFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))

  const handleBookingPageChange = (page) => setBookingFilters((prev) => ({ ...prev, page }))
  const handleBookingSizeChange = (size) => setBookingFilters((prev) => ({ ...prev, size, page: 0 }))
  const handleBookingFiltersChange = (newFilters) => setBookingFilters((prev) => ({ ...prev, ...newFilters, page: 0 }))

  const handleBuddyFiltersChange = (newFilters) => setBuddyFilters((prev) => ({ ...prev, ...newFilters }))

  // Buddy Actions: hỗ trợ cả 3 trạng thái ACTIVE, INACTIVE, SUSPENDED
  const handleUpdateBuddyStatus = async (id, status) => {
    try {
      setActionLoading(true)
      const res = await adminService.updateBuddyStatus(id, status)
      const resData = getResponseData(res)
      const affectedCount = Number(resData?.affectedRegistrations || 0)

      let title = isVi ? 'Cập nhật trạng thái thành công' : 'Buddy Status Updated'
      let message = isVi ? 'Đã cập nhật trạng thái hướng dẫn viên thành công.' : 'Buddy status updated successfully.'
      let type = 'success'

      if (status === 'ACTIVE') {
        title = isVi ? 'Kích hoạt thành công' : 'Buddy Activated'
        message = isVi ? 'Hướng dẫn viên đã được kích hoạt và sẵn sàng nhận tour.' : 'Buddy is now active and ready for tours.'
      } else if (status === 'INACTIVE' || status === 'SUSPENDED') {
        const isSuspended = status === 'SUSPENDED'
        if (affectedCount > 0) {
          type = 'warning'
          title = isSuspended
            ? (isVi ? 'Đã tạm khóa hoạt động' : 'Buddy Suspended')
            : (isVi ? 'Đã chuyển ngưng hoạt động' : 'Buddy Inactive')
          message = isVi
            ? `Đã cập nhật trạng thái. Có ${affectedCount} đơn tour bị gỡ Buddy và chuyển về "Chờ xếp Buddy". Vui lòng kiểm tra và điều phối Buddy mới!`
            : `Status updated. ${affectedCount} booking(s) have been unassigned and moved to "Waiting for Buddy". Please review and reassign!`
        } else {
          title = isSuspended
            ? (isVi ? 'Đã tạm khóa hoạt động' : 'Buddy Suspended')
            : (isVi ? 'Đã chuyển ngưng hoạt động' : 'Buddy Inactive')
          message = isVi
            ? (isSuspended
                ? 'Hướng dẫn viên đã bị tạm khóa (không có tour nào bị ảnh hưởng).'
                : 'Hướng dẫn viên đã chuyển sang tạm ngưng nhận tour (không có tour nào bị ảnh hưởng).')
            : (isSuspended
                ? 'Buddy has been suspended (no bookings were affected).'
                : 'Buddy is now inactive (no bookings were affected).')
        }
      }

      showToast({
        type,
        title,
        message,
        duration: type === 'warning' ? 6000 : 3500,
      })

      // Cập nhật lại số liệu dashboard ngầm nếu có đơn bị ảnh hưởng
      if (affectedCount > 0) {
        adminService.getDashboardSummary()
          .then((sumRes) => {
            const mapped = mapDashboardStats(sumRes)
            setDashboardData((prev) => ({ ...prev, ...mapped }))
          })
          .catch(() => {})
      }

      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái Buddy:', err)
      const errCode = err?.response?.data?.code
      const beMsg = err?.response?.data?.message
      let errMsg = getErrorMessage(err, isVi ? 'Không thể thay đổi trạng thái hướng dẫn viên.' : 'Failed to change buddy status.')

      if (errCode === 1012 || beMsg === 'Account is inactive' || beMsg?.toLowerCase()?.includes('inactive')) {
        errMsg = isVi
          ? 'Tài khoản người dùng đang bị khóa, hãy mở khóa tài khoản trước.'
          : 'The user account is currently inactive. Please unblock the user account first.'
      }

      showToast({
        type: 'error',
        title: isVi ? 'Không thể kích hoạt' : 'Activation Failed',
        message: errMsg,
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleApproveBuddy = (id) => handleUpdateBuddyStatus(id, 'ACTIVE')
  const handleRejectBuddy = (id) => handleUpdateBuddyStatus(id, 'SUSPENDED')

  // Booking Actions
  const handleConfirmPayment = async (id) => {
    try {
      setActionLoading(true)
      await adminService.confirmPayment(id)
      showToast({
        type: 'success',
        title: isVi ? 'Xác nhận thanh toán thành công' : 'Payment Confirmed',
        message: isVi ? 'Đơn đặt tour đã được xác nhận thanh toán thành công.' : 'Booking has been successfully confirmed as paid.',
      })
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi xác nhận thanh toán đặt chỗ:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Xác nhận thanh toán thất bại' : 'Payment Confirmation Failed',
        message: getErrorMessage(err, isVi ? 'Không thể xác nhận thanh toán.' : 'Failed to confirm payment.'),
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Mở modal gán Buddy
  const handleOpenAssignBuddy = async (registrationId) => {
    setAssignBuddyModal({ isOpen: true, registrationId, candidates: [], loading: true })
    try {
      const res = await adminService.getBuddyCandidates(registrationId)
      const raw = res?.data?.data ?? res?.data ?? res ?? []
      const list = Array.isArray(raw) ? raw : []
      setAssignBuddyModal((prev) => ({ ...prev, candidates: list, loading: false }))
    } catch (err) {
      console.error('Lỗi lấy danh sách Buddy:', err)
      setAssignBuddyModal((prev) => ({ ...prev, candidates: [], loading: false }))
      showToast({
        type: 'error',
        title: isVi ? 'Lỗi tải danh sách' : 'Failed to Load Candidates',
        message: isVi ? 'Không thể tải danh sách ứng viên hướng dẫn viên phù hợp.' : 'Could not load candidates for this booking.',
      })
    }
  }

  const handleCloseAssignBuddy = () =>
    setAssignBuddyModal({ isOpen: false, registrationId: null, candidates: [], loading: false })

  const handleDoAssignBuddy = async (buddyId) => {
    const { registrationId } = assignBuddyModal
    if (!registrationId || !buddyId) return
    try {
      setActionLoading(true)
      await adminService.assignBuddy(registrationId, { buddyId })
      showToast({
        type: 'success',
        title: isVi ? 'Gán hướng dẫn viên thành công' : 'Buddy Assigned Successfully',
        message: isVi ? 'Đã gán hướng dẫn viên phụ trách cho đơn đặt tour.' : 'Assigned buddy to this booking successfully.',
      })
      handleCloseAssignBuddy()
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi gán Buddy:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Gán hướng dẫn viên thất bại' : 'Failed to Assign Buddy',
        message: getErrorMessage(err, isVi ? 'Không thể gán hướng dẫn viên.' : 'Could not assign buddy.'),
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Activity Actions
  const handleCreateActivity = async ({ data, imageFile, galleryFiles = [] }) => {
    try {
      setActionLoading(true)
      const formData = new FormData()
      const requestBlob = new Blob([JSON.stringify(data)], { type: 'application/json' })
      formData.append('request', requestBlob)
      if (imageFile) {
        formData.append('image', imageFile)
      }
      if (Array.isArray(galleryFiles) && galleryFiles.length > 0) {
        galleryFiles.forEach((file) => {
          if (file) {
            formData.append('images', file)
          }
        })
      }
      await adminService.createActivity(formData)
      setIsActivityModalOpen(false)
      showToast({
        type: 'success',
        title: isVi ? 'Thêm tour mới thành công' : 'Tour Created Successfully',
        message: isVi ? 'Tour hoạt động đã được tạo thành công trong hệ thống.' : 'The new activity tour has been published in the system.',
      })
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi tạo tour mới:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Thêm tour mới thất bại' : 'Failed to Create Tour',
        message: getErrorMessage(err, isVi ? 'Không thể tạo tour mới. Vui lòng kiểm tra lại thông tin.' : 'Failed to create new tour. Please verify input data.'),
      })
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * galleryFiles: mảng theo đúng vị trí ảnh gallery hiện có.
   * - null: giữ nguyên ảnh ở vị trí đó (gửi file rỗng, Backend bỏ qua)
   * - File: thay ảnh ở vị trí đó, hoặc thêm mới nếu vượt quá số ảnh hiện có
   */
  const handleUpdateActivity = async (activityId, { data, imageFile = null, galleryFiles = [] }) => {
    try {
      setActionLoading(true)
      const formData = new FormData()
      formData.append('request', new Blob([JSON.stringify(data)], { type: 'application/json' }))
      if (imageFile) {
        formData.append('image', imageFile)
      }
      const lastChanged = galleryFiles.reduce((last, file, index) => (file ? index : last), -1)
      for (let index = 0; index <= lastChanged; index += 1) {
        formData.append('images', galleryFiles[index] ?? new File([], 'keep.jpg', { type: 'image/jpeg' }))
      }
      await adminService.updateActivity(activityId, formData)
      showToast({
        type: 'success',
        title: isVi ? 'Cập nhật tour thành công' : 'Tour Updated Successfully',
        message: isVi ? 'Thông tin tour đã được cập nhật thành công.' : 'Tour details have been updated.',
      })
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi cập nhật tour:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Cập nhật tour thất bại' : 'Failed to Update Tour',
        message: getErrorMessage(err, isVi ? 'Không thể cập nhật tour.' : 'Could not update tour.'),
      })
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteActivity = async (activityId) => {
    try {
      setActionLoading(true)
      await adminService.deleteActivity(activityId)
      showToast({
        type: 'success',
        title: isVi ? 'Xóa tour thành công' : 'Tour Deleted Successfully',
        message: isVi ? 'Tour hoạt động đã được xóa khỏi hệ thống.' : 'The tour has been removed from the system.',
      })
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi xóa tour:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Xóa tour thất bại' : 'Failed to Delete Tour',
        message: getErrorMessage(err, isVi ? 'Không thể xóa tour. Vui lòng thử lại sau.' : 'Failed to delete tour. Please try again later.'),
      })
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  // User Actions
  const handleToggleUserStatus = async (id, currentStatus, role, fullName) => {
    try {
      setActionLoading(true)
      const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      await adminService.updateUserStatus(id, nextStatus)

      const isBuddyRole = role === 'BUDDY'

      if (nextStatus === 'INACTIVE' && isBuddyRole) {
        showToast({
          type: 'warning',
          title: isVi ? 'Đã ngưng hoạt động tài khoản Buddy' : 'Buddy Account Deactivated',
          message: isVi
            ? `Tài khoản ${fullName ? `"${fullName}"` : ''} đã chuyển sang ngưng hoạt động. Hồ sơ Buddy đã được đồng bộ ngưng nhận tour và các tour sắp diễn ra đã được gỡ về "Chờ xếp Buddy".`
            : `User account has been set to Inactive. The associated Buddy profile is now inactive and upcoming tours have been moved to "Waiting for Buddy".`,
          duration: 6000,
        })
        // Cập nhật lại số liệu dashboard ngầm
        adminService.getDashboardSummary()
          .then((sumRes) => {
            const mapped = mapDashboardStats(sumRes)
            setDashboardData((prev) => ({ ...prev, ...mapped }))
          })
          .catch(() => {})
      } else {
        showToast({
          type: 'success',
          title: isVi ? 'Cập nhật trạng thái thành công' : 'User Status Updated',
          message: isVi
            ? `Đã chuyển trạng thái người dùng sang "${nextStatus === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động'}" thành công.`
            : `User status has been successfully updated to "${nextStatus === 'ACTIVE' ? 'Active' : 'Inactive'}".`,
        })
      }

      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái người dùng:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Cập nhật trạng thái thất bại' : 'Failed to Update User Status',
        message: getErrorMessage(err, isVi ? 'Không thể cập nhật trạng thái người dùng.' : 'Could not update user status.'),
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Coupon Actions
  const handleOpenCreateCoupon = () => {
    setEditingCoupon(null)
    setIsCouponModalOpen(true)
  }

  const handleOpenEditCoupon = (coupon) => {
    setEditingCoupon(coupon)
    setIsCouponModalOpen(true)
  }

  const handleCloseCouponModal = () => {
    setEditingCoupon(null)
    setIsCouponModalOpen(false)
  }

  const handleSaveCoupon = async (payload) => {
    try {
      setActionLoading(true)
      if (editingCoupon?.id) {
        await adminService.updateCoupon(editingCoupon.id, payload)
        showToast({
          type: 'success',
          title: isVi ? 'Cập nhật mã giảm giá thành công' : 'Coupon Updated Successfully',
          message: isVi ? 'Thông tin mã giảm giá đã được cập nhật.' : 'Coupon information has been updated.',
        })
      } else {
        await adminService.createCoupon(payload)
        showToast({
          type: 'success',
          title: isVi ? 'Tạo mã giảm giá thành công' : 'Coupon Created Successfully',
          message: isVi ? 'Mã giảm giá mới đã sẵn sàng sử dụng.' : 'The new coupon is now active.',
        })
      }
      setIsCouponModalOpen(false)
      setEditingCoupon(null)
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi lưu mã coupon:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Lưu mã giảm giá thất bại' : 'Failed to Save Coupon',
        message: getErrorMessage(err, isVi ? 'Không thể lưu mã giảm giá.' : 'Failed to save coupon.'),
      })
      throw err
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleCouponStatus = async (id) => {
    try {
      setActionLoading(true)
      await adminService.toggleCouponStatus(id)
      showToast({
        type: 'success',
        title: isVi ? 'Đổi trạng thái thành công' : 'Coupon Status Updated',
        message: isVi ? 'Trạng thái hoạt động của mã giảm giá đã được thay đổi.' : 'Coupon status has been successfully updated.',
      })
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi đổi trạng thái coupon:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Đổi trạng thái thất bại' : 'Failed to Update Coupon Status',
        message: getErrorMessage(err, isVi ? 'Không thể đổi trạng thái mã giảm giá.' : 'Could not change coupon status.'),
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Feedback Actions
  const handleDeleteFeedback = async (id) => {
    try {
      setActionLoading(true)
      await adminService.deleteFeedback(id)
      showToast({
        type: 'success',
        title: isVi ? 'Xóa đánh giá thành công' : 'Review Deleted Successfully',
        message: isVi ? 'Đánh giá vi phạm đã được gỡ bỏ khỏi hệ thống.' : 'The review has been removed from the system.',
      })
      refreshCurrentTab()
    } catch (err) {
      console.error('Lỗi xóa feedback:', err)
      showToast({
        type: 'error',
        title: isVi ? 'Xóa đánh giá thất bại' : 'Failed to Delete Review',
        message: getErrorMessage(err, isVi ? 'Không thể xóa đánh giá.' : 'Failed to delete review.'),
      })
    } finally {
      setActionLoading(false)
    }
  }

  return {
    activeTab,
    loading,
    error,
    actionLoading,
    dashboardData,
    activities,
    bookings,
    buddies,
    users,
    coupons,
    payments,
    feedbacks,
    isActivityModalOpen,
    setIsActivityModalOpen,
    handleCreateActivity,
    handleUpdateActivity,
    handleDeleteActivity,
    isCouponModalOpen,
    setIsCouponModalOpen,
    editingCoupon,
    handleOpenCreateCoupon,
    handleOpenEditCoupon,
    handleCloseCouponModal,
    handleSaveCoupon,
    assignBuddyModal,
    handleOpenAssignBuddy,
    handleCloseAssignBuddy,
    handleDoAssignBuddy,
    handleSelectTab,
    refreshCurrentTab,
    handleUpdateBuddyStatus,
    handleApproveBuddy,
    handleRejectBuddy,
    handleConfirmPayment,
    handleAssignBuddy: handleOpenAssignBuddy,
    handleToggleUserStatus,
    handleCreateCoupon: handleSaveCoupon,
    handleToggleCouponStatus,
    handleDeleteFeedback,

    // Toast
    toast,
    showToast,
    hideToast,

    // Pagination & Filters
    userFilters,
    userPagination,
    handleUserPageChange,
    handleUserSizeChange,
    handleUserFiltersChange,

    paymentFilters,
    paymentPagination,
    handlePaymentPageChange,
    handlePaymentSizeChange,
    handlePaymentFiltersChange,

    feedbackFilters,
    feedbackPagination,
    handleFeedbackPageChange,
    handleFeedbackSizeChange,
    handleFeedbackFiltersChange,

    bookingFilters,
    bookingPagination,
    handleBookingPageChange,
    handleBookingSizeChange,
    handleBookingFiltersChange,

    buddyFilters,
    handleBuddyFiltersChange,
  }
}