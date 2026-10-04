import { useState, useEffect, useMemo, Fragment } from 'react'

import adminService from '@/services/adminService.js'
import { useLanguage } from '@/context/languageContext.js'
import { formatDDMMYYYY, formatMoney } from '@/utils/format.js'
import { AdminAddDepartureModal, AdminEditCapacityModal } from './AdminDepartureModals.jsx'
import { AdminEditActivityModal } from './AdminEditActivityModal.jsx'
import { AdminDeleteActivityModal } from './AdminDeleteActivityModal.jsx'
import { AdminPagination } from './AdminPagination.jsx'

// ActivityStatus: PUBLISHED, UPCOMING, ONGOING, COMPLETED, CANCELLED
const ACTIVITY_STATUS_MAP = {
  PUBLISHED: { label: 'Đang mở', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  UPCOMING: { label: 'Sắp diễn ra', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' },
  ONGOING: { label: 'Đang diễn ra', badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  COMPLETED: { label: 'Hoàn thành', badgeClass: 'border-slate-200 bg-slate-100 text-slate-700' },
  CANCELLED: { label: 'Đã hủy', badgeClass: 'border-rose-200 bg-rose-50 text-rose-700' },
}

// DepartureStatus
const DEPARTURE_STATUS_MAP = {
  OPEN: { label: 'Mở đăng ký', cls: 'text-emerald-600' },
  FULL: { label: 'Đủ chỗ', cls: 'text-amber-600' },
  COMPLETED: { label: 'Xong', cls: 'text-slate-400' },
  CANCELLED: { label: 'Đã hủy', cls: 'text-rose-500' },
  IN_PROGRESS: { label: 'Đang diễn ra', cls: 'text-indigo-600' },
}

// RegistrationStatus badge
const REG_STATUS = {
  PENDING_PAYMENT: { label: 'Chờ TT', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  PAYMENT_REVIEW: { label: 'Xét duyệt TT', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  WAITING_FOR_BUDDY: { label: 'Chờ Buddy', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  BUDDY_ASSIGNED: { label: 'Đã có Buddy', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  CONFIRMED: { label: 'Xác nhận', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Đang diễn', cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  CANCELLED: { label: 'Đã hủy', cls: 'bg-rose-50 text-rose-700 border-rose-200' },
}

// TourType enum chuẩn BE: FOODTOUR, HISTORYTOUR
const TOUR_TYPE_LABEL = {
  FOODTOUR: 'Food Tour (Ẩm thực)',
  HISTORYTOUR: 'History Tour (Lịch sử & Văn hóa)',
}

function ChevronIcon({ open }) {
  return (
    <svg
      className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

/** Panel mở rộng cho từng activity: 2 tab - Ca khởi hành & Khách đăng ký */
function ActivityExpandPanel({ activity, onRefresh }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [activeInnerTab, setActiveInnerTab] = useState('departures')
  const [registrations, setRegistrations] = useState(null) // null = chưa load
  const [regLoading, setRegLoading] = useState(false)
  const [addDepModalOpen, setAddDepModalOpen] = useState(false)
  const [editingDep, setEditingDep] = useState(null)

  // Tự động load danh sách khách đăng ký của activity để tính số khách đã đặt cho từng ca
  useEffect(() => {
    let isMounted = true
    const fetchRegs = async () => {
      setRegLoading(true)
      try {
        const res = await adminService.getRegistrations({ activityId: activity.id, size: 50 })
        const items = res?.data?.data?.content ?? res?.data?.content ?? res?.content ?? []
        if (isMounted) {
          setRegistrations(Array.isArray(items) ? items : [])
        }
      } catch {
        if (isMounted) setRegistrations([])
      } finally {
        if (isMounted) setRegLoading(false)
      }
    }
    fetchRegs()
    return () => {
      isMounted = false
    }
  }, [activity.id])

  // Tính số lượng khách đã đặt vé cho từng ca khởi hành (để biết chính xác số chỗ còn lại)
  const reservedByDep = useMemo(() => {
    const map = {}
    if (Array.isArray(registrations)) {
      registrations.forEach((item) => {
        const b = item?.booking ?? item
        if (b?.status !== 'CANCELLED' && b?.departure?.departureId) {
          const guests = (Number(b.adultCount) || 0) + (Number(b.childCount) || 0) || 1
          const depId = String(b.departure.departureId)
          map[depId] = (map[depId] || 0) + guests
        }
      })
    }
    return map
  }, [registrations])

  const getDepStatus = (status) => {
    switch (status) {
      case 'OPEN': return { label: isVi ? 'Mở đăng ký' : 'Open', cls: 'text-emerald-600' }
      case 'FULL': return { label: isVi ? 'Đủ chỗ' : 'Full', cls: 'text-amber-600' }
      case 'COMPLETED': return { label: isVi ? 'Xong' : 'Completed', cls: 'text-slate-400' }
      case 'CANCELLED': return { label: isVi ? 'Đã hủy' : 'Cancelled', cls: 'text-rose-500' }
      case 'IN_PROGRESS': return { label: isVi ? 'Đang diễn ra' : 'In Progress', cls: 'text-indigo-600' }
      default: return { label: status || '—', cls: 'text-slate-400' }
    }
  }

  const getRegStatus = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT': return { label: isVi ? 'Chờ TT' : 'Pending', cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' }
      case 'PAYMENT_REVIEW': return { label: isVi ? 'Xét duyệt TT' : 'Review', cls: 'bg-amber-50 text-amber-700 border-amber-200' }
      case 'WAITING_FOR_BUDDY': return { label: isVi ? 'Chờ Buddy' : 'Need Buddy', cls: 'bg-orange-50 text-orange-700 border-orange-200' }
      case 'BUDDY_ASSIGNED': return { label: isVi ? 'Đã có Buddy' : 'Buddy Ready', cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
      case 'CONFIRMED': return { label: isVi ? 'Xác nhận' : 'Confirmed', cls: 'bg-blue-50 text-blue-700 border-blue-200' }
      case 'IN_PROGRESS': return { label: isVi ? 'Đang diễn' : 'In Progress', cls: 'bg-violet-50 text-violet-700 border-violet-200' }
      case 'COMPLETED': return { label: isVi ? 'Hoàn thành' : 'Completed', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
      case 'CANCELLED': return { label: isVi ? 'Đã hủy' : 'Cancelled', cls: 'bg-rose-50 text-rose-700 border-rose-200' }
      default: return { label: status || '—', cls: 'bg-slate-50 text-slate-500 border-slate-200' }
    }
  }

  const loadRegistrations = async () => {
    if (registrations !== null) return // đã load rồi
    setRegLoading(true)
    try {
      const res = await adminService.getRegistrations({ activityId: activity.id, size: 50 })
      const items = res?.data?.data?.content ?? res?.data?.content ?? res?.content ?? []
      setRegistrations(Array.isArray(items) ? items : [])
    } catch {
      setRegistrations([])
    } finally {
      setRegLoading(false)
    }
  }

  const handleTabClick = (tab) => {
    setActiveInnerTab(tab)
    if (tab === 'customers' && registrations === null) {
      loadRegistrations()
    }
  }

  return (
    <div className="border-b border-slate-100 bg-slate-50/50">
      {/* Inner tab bar */}
      <div className="flex items-center gap-0 border-b border-slate-100 px-5">
        <button
          type="button"
          onClick={() => handleTabClick('departures')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition ${activeInnerTab === 'departures'
            ? 'border-blue-950 text-blue-950'
            : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {isVi ? 'Khung giờ' : 'Time Slots'} ({activity.departures?.length ?? 0})
        </button>
        <button
          type="button"
          onClick={() => handleTabClick('customers')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition ${activeInnerTab === 'customers'
            ? 'border-blue-950 text-blue-950'
            : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
          {isVi ? 'Khách tham gia' : 'Participants'}
          {registrations !== null && (
            <span className="ml-0.5 rounded-full bg-blue-950/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-950">
              {registrations.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab content */}
      <div className="px-5 py-4">
        {/* Tab: Ca khởi hành */}
        {activeInnerTab === 'departures' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {activity.departures?.length ?? 0} {isVi ? 'ca khởi hành' : 'departures'}
              </span>
              <button
                type="button"
                onClick={() => setAddDepModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-950 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-900 active:scale-95"
              >
                <span className="text-sm leading-none font-black">+</span>
                <span>{isVi ? 'Thêm ca khởi hành' : 'Add Departure'}</span>
              </button>
            </div>

            {activity.departures?.length === 0 ? (
              <p className="text-xs text-slate-400">
                {isVi ? 'Chưa có ca khởi hành nào được tạo cho hoạt động này.' : 'No departures scheduled for this activity.'}
              </p>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                {activity.departures?.map((dep, idx) => {
                  const depStatus = getDepStatus(dep.status)
                  return (
                    <div
                      key={dep.departureId || idx}
                      className="min-w-[160px] flex-shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {isVi ? `Ca ${idx + 1}` : `Slot ${idx + 1}`}
                        </span>
                        <span className={`text-[10px] font-bold ${depStatus.cls}`}>
                          {depStatus.label}
                        </span>
                      </div>
                      <span className="mt-1 block text-sm font-black text-blue-950">
                        {dep.startTime && dep.endTime
                          ? `${dep.startTime} – ${dep.endTime}`
                          : dep.startTime || '—'}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {formatDDMMYYYY(dep.departureDate) || (isVi ? 'Chưa có ngày' : 'No date')}
                      </span>
                      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2">
                        {(() => {
                          const depReserved = Number(dep.reservedGuests || reservedByDep[dep.departureId] || 0)
                          const total = Number(dep.totalCapacity || (dep.capacity + depReserved))
                          return (
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">
                                {total > 0 ? `${total} ${isVi ? 'chỗ' : 'seats'}` : '—'}
                              </span>
                              {depReserved > 0 && (
                                <span className="text-[10px] font-semibold text-emerald-600">
                                  {isVi ? `(còn ${dep.remainingSeats ?? dep.capacity} chỗ)` : `(${dep.remainingSeats ?? dep.capacity} left)`}
                                </span>
                              )}
                            </div>
                          )
                        })()}
                        {dep.departureId && (
                          <button
                            type="button"
                            onClick={() => {
                              const depReserved = Number(dep.reservedGuests || reservedByDep[dep.departureId] || 0)
                              const total = Number(dep.totalCapacity || (dep.capacity + depReserved))
                              setEditingDep({
                                ...dep,
                                reservedGuests: depReserved,
                                totalCapacity: total,
                                remainingSeats: dep.remainingSeats ?? dep.capacity,
                              })
                            }}
                            className="text-[11px] font-bold text-blue-950 hover:underline"
                          >
                            {isVi ? 'Sửa chỗ' : 'Edit seats'}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <AdminAddDepartureModal
              isOpen={addDepModalOpen}
              activity={activity}
              onClose={() => setAddDepModalOpen(false)}
              onSuccess={onRefresh}
            />

            <AdminEditCapacityModal
              isOpen={Boolean(editingDep)}
              departure={editingDep}
              activity={activity}
              onClose={() => setEditingDep(null)}
              onSuccess={onRefresh}
            />
          </div>
        )}

        {/* Tab: Khách tham gia */}
        {activeInnerTab === 'customers' && (
          regLoading ? (
            <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
              {isVi ? 'Đang tải danh sách khách...' : 'Loading participants...'}
            </div>
          ) : registrations === null ? null : registrations.length === 0 ? (
            <p className="text-xs text-slate-400">
              {isVi ? 'Chưa có khách đăng ký cho hoạt động này.' : 'No participants registered for this activity yet.'}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="border-b border-slate-200 bg-white text-[11px] font-bold text-blue-950">
                  <tr>
                    <th className="px-5 py-2">{isVi ? 'Khách hàng' : 'Customer'}</th>
                    <th className="px-5 py-2">{isVi ? 'Liên hệ' : 'Contact'}</th>
                    <th className="px-5 py-2">{isVi ? 'Ngày / Giờ' : 'Date / Time'}</th>
                    <th className="px-5 py-2">{isVi ? 'Số vé' : 'Tickets'}</th>
                    <th className="px-5 py-2">{isVi ? 'Tổng tiền' : 'Total Amount'}</th>
                    <th className="px-5 py-2">{isVi ? 'Trạng thái' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {registrations.map((item, idx) => {
                    const booking = item?.booking ?? item
                    const customer = item?.customer ?? null
                    const name = customer?.fullName || (customer?.email?.split('@')[0]) || '—'
                    const email = customer?.email || ''
                    const phone = customer?.phone || ''
                    const depDate = formatDDMMYYYY(booking?.departure?.departureDate) || ''
                    const startTime = booking?.departure?.startTime
                      ? String(booking.departure.startTime).slice(0, 5)
                      : ''
                    const adults = Number(booking?.adultCount ?? 0)
                    const children = Number(booking?.childCount ?? 0)
                    const total = Number(booking?.totalAmount ?? 0)
                    const status = booking?.status || ''
                    const regInfo = getRegStatus(status)

                    return (
                      <tr key={booking?.registrationId ?? idx} className="hover:bg-white/80 transition">
                        <td className="px-5 py-2.5 font-semibold text-blue-950">{name}</td>
                        <td className="px-5 py-2.5">
                          {email && <p className="text-slate-600">{email}</p>}
                          {phone && <p className="text-slate-400">{phone}</p>}
                        </td>
                        <td className="px-5 py-2.5">
                          {startTime && <p>{startTime}</p>}
                          {depDate && <p className="text-slate-400">{depDate}</p>}
                        </td>
                        <td className="px-5 py-2.5">
                          {adults > 0 && <p>{adults} {isVi ? 'người lớn' : 'adults'}</p>}
                          {children > 0 && <p className="text-slate-400">{children} {isVi ? 'trẻ em' : 'children'}</p>}
                        </td>
                        <td className="px-5 py-2.5 font-bold text-blue-950">
                          {total > 0 ? formatMoney(total) : '—'}
                        </td>
                        <td className="px-5 py-2.5">
                          <span className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${regInfo.cls}`}>
                            {regInfo.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  )
}

export function AdminActivitiesSection({
  activities = [],
  loading = false,
  onOpenCreateModal,
  onUpdateActivity,
  onDeleteActivity,
  onRefresh,
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [editingActivity, setEditingActivity] = useState(null)
  const [deletingActivity, setDeletingActivity] = useState(null)

  const getActivityStatusInfo = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return { label: isVi ? 'Đang mở' : 'Published', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
      case 'UPCOMING':
        return { label: isVi ? 'Sắp diễn ra' : 'Upcoming', badgeClass: 'border-blue-200 bg-blue-50 text-blue-700' }
      case 'ONGOING':
        return { label: isVi ? 'Đang diễn ra' : 'Ongoing', badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-700' }
      case 'COMPLETED':
        return { label: isVi ? 'Hoàn thành' : 'Completed', badgeClass: 'border-slate-200 bg-slate-100 text-slate-700' }
      case 'CANCELLED':
        return { label: isVi ? 'Đã hủy' : 'Cancelled', badgeClass: 'border-rose-200 bg-rose-50 text-rose-700' }
      default:
        return { label: status || '—', badgeClass: 'border-slate-200 bg-slate-100 text-slate-700' }
    }
  }

  const getTourTypeLabel = (type) => {
    if (type === 'FOODTOUR') return isVi ? 'Food Tour (Ẩm thực)' : 'Food Tour'
    if (type === 'HISTORYTOUR') return isVi ? 'History Tour (Lịch sử & VH)' : 'History Tour'
    return type || '—'
  }

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
          <span>{t('admin.common.loading')}</span>
        </div>
      </div>
    )
  }

  const filteredActivities = activities.filter((act) => {
    if (selectedStatus && act.status !== selectedStatus) return false
    if (selectedType && act.activityType !== selectedType) return false
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      act.title?.toLowerCase().includes(term) ||
      act.locationName?.toLowerCase().includes(term)
    )
  })

  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1
  const paginatedActivities = filteredActivities.slice(page * pageSize, (page + 1) * pageSize)

  return (
    <div className="space-y-4">
      {/* 1. THANH BỘ LỌC TÌM KIẾM, LOẠI TOUR, TRẠNG THÁI */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Tìm kiếm */}
        <div className="relative max-w-xs flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            placeholder={isVi ? 'Tìm theo tên tour, địa điểm...' : 'Search by tour name, location...'}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pl-9 pr-8 text-xs text-slate-900 outline-none transition focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('')
                setPage(0)
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Bộ lọc dropdowns & nút Thêm tour */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc Loại tour */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{isVi ? 'Loại:' : 'Type:'}</span>
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value)
                setPage(0)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
            >
              <option value="">{isVi ? 'Tất cả loại tour' : 'All Tour Types'}</option>
              <option value="FOODTOUR">{isVi ? 'Food Tour (Ẩm thực)' : 'Food Tour'}</option>
              <option value="HISTORYTOUR">{isVi ? 'History Tour (Lịch sử & Văn hóa)' : 'History Tour'}</option>
            </select>
          </div>

          {/* Lọc Trạng thái */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{isVi ? 'Trạng thái:' : 'Status:'}</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(0)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
            >
              <option value="">{isVi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
              <option value="PUBLISHED">{isVi ? 'Đang mở' : 'Published'}</option>
              <option value="UPCOMING">{isVi ? 'Sắp diễn ra' : 'Upcoming'}</option>
              <option value="ONGOING">{isVi ? 'Đang diễn ra' : 'Ongoing'}</option>
              <option value="COMPLETED">{isVi ? 'Hoàn thành' : 'Completed'}</option>
              <option value="CANCELLED">{isVi ? 'Đã hủy' : 'Cancelled'}</option>
            </select>
          </div>

          {/* Nút Tạo tour mới */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-400 px-3.5 py-2 text-xs font-bold text-blue-950 shadow-sm transition hover:bg-yellow-300 active:scale-95"
          >
            <span className="text-base leading-none font-black">+</span>
            <span>{isVi ? 'Tạo tour mới' : 'Create New Tour'}</span>
          </button>
        </div>
      </div>

      {filteredActivities.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="font-bold text-blue-950">{t('admin.activities.emptyTitle')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('admin.activities.emptyDesc')}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-blue-950">
              <tr>
                <th className="px-5 py-3.5">{isVi ? 'Hoạt động' : 'Activity'}</th>
                <th className="px-5 py-3.5">{isVi ? 'Loại tour' : 'Tour Type'}</th>
                <th className="px-5 py-3.5">{isVi ? 'Phí tham gia' : 'Price'}</th>
                <th className="px-5 py-3.5">{isVi ? 'Quy mô' : 'Capacity'}</th>
                <th className="px-5 py-3.5">{isVi ? 'Trạng thái' : 'Status'}</th>
                <th className="px-5 py-3.5 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedActivities.map((act) => {
                const statusInfo = getActivityStatusInfo(act.status)
                const capacityText = isVi ? `Tối thiểu ${act.minParticipants || 1} khách` : `Min ${act.minParticipants || 1} guests`
                const isExpanded = expandedIds.has(act.id)

                return (
                  <Fragment key={act.id}>
                    <tr
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50/80 ${isExpanded ? 'bg-blue-950/[0.02]' : ''
                        }`}
                      onClick={() => toggleExpand(act.id)}
                    >
                      {/* Cột 1: Tên & địa điểm */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ChevronIcon open={isExpanded} />
                          {act.thumbnailUrl ? (
                            <img src={act.thumbnailUrl} alt={act.title} className="h-10 w-10 shrink-0 rounded-xl object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-950/10 text-sm font-bold text-blue-950">
                              {act.title?.charAt(0) || 'P'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="line-clamp-1 font-bold text-blue-950">{act.title}</p>
                            {act.locationName && (
                              <p className="line-clamp-1 text-xs text-slate-400">
                                {act.locationName}
                              </p>
                            )}
                            <p className="text-[11px] font-medium text-blue-500">
                              {act.departures?.length > 0
                                ? (isVi ? `${act.departures.length} ca · nhấn để xem` : `${act.departures.length} slots · click to view`)
                                : (isVi ? 'Nhấn để xem chi tiết' : 'Click to view details')}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Loại tour */}
                      <td className="px-5 py-4 text-xs font-medium">
                        {act.activityType ? (
                          <span className="rounded-lg bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                            {getTourTypeLabel(act.activityType)}
                          </span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>

                      {/* Cột 3: Giá */}
                      <td className="px-5 py-4 font-bold text-blue-950">
                        {act.price > 0 ? formatMoney(act.price) : (isVi ? 'Miễn phí' : 'Free')}
                      </td>

                      {/* Cột 4: Sức chứa */}
                      <td className="px-5 py-4 text-xs font-semibold text-slate-700">
                        {capacityText}
                      </td>

                      {/* Cột 5: Trạng thái */}
                      <td className="px-5 py-4">
                        <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Cột 6: Thao tác (Sửa & Xóa) */}
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title={isVi ? 'Chỉnh sửa tour' : 'Edit tour'}
                            onClick={() => setEditingActivity(act)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-blue-950 transition hover:border-blue-950 hover:bg-blue-50 active:scale-95"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            title={isVi ? 'Xóa tour' : 'Delete tour'}
                            onClick={() => setDeletingActivity(act)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 text-rose-600 transition hover:border-rose-400 hover:bg-rose-50 active:scale-95"
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable panel */}
                    {isExpanded && (
                      <tr key={`${act.id}-expand`}>
                        <td colSpan={6} className="p-0">
                          <ActivityExpandPanel activity={act} onRefresh={onRefresh} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>

          {/* Phân trang */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={filteredActivities.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setPage(0)
            }}
          />
        </div>
      )}

      {/* Modal chỉnh sửa tour */}
      <AdminEditActivityModal
        isOpen={Boolean(editingActivity)}
        activity={editingActivity}
        onClose={() => setEditingActivity(null)}
        onUpdate={onUpdateActivity}
      />

      {/* Modal xác nhận xóa tour */}
      <AdminDeleteActivityModal
        isOpen={Boolean(deletingActivity)}
        activity={deletingActivity}
        onClose={() => setDeletingActivity(null)}
        onDelete={onDeleteActivity}
      />
    </div>
  )
}