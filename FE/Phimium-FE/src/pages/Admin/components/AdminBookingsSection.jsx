import { useEffect, useState, useRef } from 'react'

import { useLanguage } from '@/context/languageContext.js'
import { formatDDMMYYYY, formatMoney, matchSearchText } from '@/utils/format.js'
import { AdminBookingDetailModal } from './AdminBookingDetailModal.jsx'
import { AdminPagination } from './AdminPagination.jsx'

// Component Action Menu dạng Dropdown 3 chấm (•••) cho cột Thao tác
function BookingActionMenu({
  booking,
  onView,
  onAssignBuddy,
  onConfirmPayment,
  actionLoading,
  isVi,
  isNearBottom,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleAction = (e, callback) => {
    e.stopPropagation()
    setIsOpen(false)
    callback?.()
  }

  return (
    <div className="relative inline-flex items-center justify-center" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
          isOpen
            ? 'border-blue-950 bg-blue-50 text-blue-950 shadow-sm ring-2 ring-blue-950/10'
            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'
        }`}
        title={isVi ? 'Tùy chọn thao tác' : 'Actions'}
        aria-label="Actions"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 z-50 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl transition animate-in fade-in zoom-in-95 duration-100 ${
            isNearBottom ? 'bottom-full mb-1.5 origin-bottom-right' : 'top-full mt-1.5 origin-top-right'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Xem chi tiết */}
          <button
            type="button"
            onClick={(e) => handleAction(e, onView)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-blue-950 transition text-left"
          >
            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{isVi ? 'Xem chi tiết' : 'View Details'}</span>
          </button>

          {/* Gán Buddy nếu trạng thái WAITING_FOR_BUDDY */}
          {booking.status === 'WAITING_FOR_BUDDY' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={(e) => handleAction(e, onAssignBuddy)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition text-left disabled:opacity-50"
            >
              <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <span>{isVi ? 'Gán Buddy' : 'Assign Buddy'}</span>
            </button>
          )}

          {/* Duyệt thanh toán nếu trạng thái PAYMENT_REVIEW */}
          {booking.status === 'PAYMENT_REVIEW' && (
            <button
              type="button"
              disabled={actionLoading}
              onClick={(e) => handleAction(e, onConfirmPayment)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition text-left disabled:opacity-50"
            >
              <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{isVi ? 'Duyệt thanh toán' : 'Confirm Payment'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function AdminBookingsSection({
  bookings = [],
  loading = false,
  actionLoading = false,
  filters = { page: 0, size: 10, status: '', activityId: '', keyword: '' },
  pagination = { page: 0, size: 10, totalPages: 1, totalElements: 0 },
  onPageChange,
  onSizeChange,
  onFiltersChange,
  onConfirmPayment,
  onAssignBuddy,
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'
  const [searchTerm, setSearchTerm] = useState(filters?.keyword || '')
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  useEffect(() => {
    setSearchTerm(filters?.keyword || '')
  }, [filters?.keyword])

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING_PAYMENT':
        return {
          label: isVi ? 'Chờ thanh toán' : 'Pending Payment',
          badgeClass: 'border-yellow-200 bg-yellow-50 text-yellow-800',
        }
      case 'PAYMENT_REVIEW':
        return {
          label: isVi ? 'Chờ xác nhận TT' : 'Payment Review',
          badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
        }
      case 'WAITING_FOR_BUDDY':
        return {
          label: isVi ? 'Chờ ghép Buddy' : 'Waiting for Buddy',
          badgeClass: 'border-amber-300 bg-amber-50 text-amber-900 font-bold shadow-xs',
        }
      case 'BUDDY_ASSIGNED':
        return {
          label: isVi ? 'Đã có Buddy' : 'Buddy Assigned',
          badgeClass: 'border-indigo-200 bg-indigo-50 text-indigo-700',
        }
      case 'CONFIRMED':
        return {
          label: isVi ? 'Đã xác nhận' : 'Confirmed',
          badgeClass: 'border-blue-200 bg-blue-50 text-blue-700',
        }
      case 'IN_PROGRESS':
        return {
          label: isVi ? 'Đang diễn ra' : 'In Progress',
          badgeClass: 'border-violet-200 bg-violet-50 text-violet-700',
        }
      case 'COMPLETED':
        return {
          label: isVi ? 'Hoàn thành' : 'Completed',
          badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        }
      case 'CANCELLED':
        return {
          label: isVi ? 'Đã hủy' : 'Cancelled',
          badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
        }
      default:
        return {
          label: status || (isVi ? 'Chưa xác định' : 'Unknown'),
          badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
        }
    }
  }

  const filteredBookings = bookings.filter((b) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.trim()
    return (
      matchSearchText(b.invoiceCode, term) ||
      matchSearchText(b.customerName, term) ||
      matchSearchText(b.customerEmail, term) ||
      matchSearchText(b.activityTitle, term)
    )
  })

  return (
    <div className="space-y-4">
      {/* 1. THANH BỘ LỌC TÌM KIẾM & TRẠNG THÁI */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Tìm kiếm */}
        <div className="relative max-w-sm flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isVi ? 'Tìm theo mã hoá đơn, tên khách, tour...' : 'Search by invoice code, customer, tour...'}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 pl-9 pr-8 text-xs text-slate-900 outline-none transition focus:border-blue-950 focus:ring-1 focus:ring-blue-950"
          />
          <svg
            className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Lọc trạng thái đặt chỗ */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{isVi ? 'Trạng thái:' : 'Status:'}</span>
          <select
            value={filters?.status || ''}
            onChange={(e) => onFiltersChange?.({ status: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
          >
            <option value="">{isVi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
            <option value="WAITING_FOR_BUDDY">{isVi ? 'Chờ ghép Buddy' : 'Waiting for Buddy'}</option>
            <option value="BUDDY_ASSIGNED">{isVi ? 'Đã có Buddy' : 'Buddy Assigned'}</option>
            <option value="CONFIRMED">{isVi ? 'Đã xác nhận' : 'Confirmed'}</option>
            <option value="PENDING_PAYMENT">{isVi ? 'Chờ thanh toán' : 'Pending Payment'}</option>
            <option value="PAYMENT_REVIEW">{isVi ? 'Chờ duyệt thanh toán' : 'Payment Review'}</option>
            <option value="IN_PROGRESS">{isVi ? 'Đang diễn ra' : 'In Progress'}</option>
            <option value="COMPLETED">{isVi ? 'Hoàn thành' : 'Completed'}</option>
            <option value="CANCELLED">{isVi ? 'Đã hủy' : 'Cancelled'}</option>
          </select>
        </div>
      </div>

      {/* 2. BẢNG DỮ LIỆU ĐƠN ĐẶT (Không cuộn ngang, fit 100% màn hình) */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
            <span>{t('admin.common.loading')}</span>
          </div>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="font-bold text-blue-950">{t('admin.bookings.emptyTitle')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('admin.bookings.emptyDesc')}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full table-fixed text-left text-sm text-slate-600">
            <colgroup>
              <col className="w-[20%]" />
              <col className="w-[25%]" />
              <col className="w-[14%]" />
              <col className="w-[15%]" />
              <col className="w-[19%]" />
              <col className="w-[7%]" />
            </colgroup>
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-blue-950">
              <tr>
                <th className="px-4 py-3.5">{isVi ? 'Khách hàng' : 'Customer'}</th>
                <th className="px-4 py-3.5">{isVi ? 'Tour đặt' : 'Booked Tour'}</th>
                <th className="px-4 py-3.5">{isVi ? 'Tổng tiền' : 'Total Amount'}</th>
                <th className="px-4 py-3.5">{isVi ? 'Hướng dẫn viên' : 'Buddy'}</th>
                <th className="px-4 py-3.5">{isVi ? 'Trạng thái' : 'Status'}</th>
                <th className="px-2 py-3.5 text-center">{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredBookings.map((b, index) => {
                const statusInfo = getStatusInfo(b.status)

                return (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBookingId(b.id)}
                    className={`group cursor-pointer transition ${
                      b.status === 'WAITING_FOR_BUDDY'
                        ? 'bg-amber-50/30 hover:bg-amber-50/70'
                        : 'hover:bg-slate-50/70'
                    }`}
                  >
                    {/* Khách hàng (gộp mã đơn vào subtitle) */}
                    <td className="px-4 py-3.5 align-middle">
                      <p
                        className="truncate font-semibold text-slate-900 group-hover:text-blue-950 transition"
                        title={b.customerName}
                      >
                        {b.customerName || (isVi ? 'Khách vãng lai' : 'Guest')}
                      </p>
                      <p className="truncate text-xs text-slate-400">
                        {b.customerEmail || ''}
                      </p>
                    </td>

                    {/* Tour đặt */}
                    <td className="px-4 py-3.5 align-middle">
                      <p
                        className="truncate font-semibold text-blue-950 group-hover:text-blue-600 transition"
                        title={b.activityTitle}
                      >
                        {b.activityTitle || '—'}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-400">
                        {formatDDMMYYYY(b.departureDate) || '—'} {b.departureTime ? `· ${b.departureTime}` : ''}
                      </p>
                    </td>

                    {/* Tổng tiền */}
                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <span className="text-sm font-bold text-blue-950">
                        {formatMoney(b.totalAmount)}
                      </span>
                    </td>

                    {/* Hướng dẫn viên (Buddy) */}
                    <td className="px-4 py-3.5 align-middle">
                      {b.buddyName ? (
                        <span
                          className="inline-flex max-w-full items-center rounded-lg bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100/80 shadow-2xs truncate"
                          title={b.buddyName}
                        >
                          <span className="truncate">{b.buddyName}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs text-slate-400 italic">
                          {isVi ? 'Chưa gán' : 'Unassigned'}
                        </span>
                      )}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3.5 align-middle">
                      <span
                        className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusInfo.badgeClass}`}
                      >
                        <span>{statusInfo.label}</span>
                      </span>
                    </td>

                    {/* Thao tác (Nút 3 chấm gọn gàng 32px) */}
                    <td className="px-2 py-3.5 text-center align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <BookingActionMenu
                        booking={b}
                        onView={() => setSelectedBookingId(b.id)}
                        onAssignBuddy={() => onAssignBuddy?.(b.id)}
                        onConfirmPayment={() => onConfirmPayment?.(b.id)}
                        actionLoading={actionLoading}
                        isVi={isVi}
                        isNearBottom={index >= filteredBookings.length - 2 && filteredBookings.length > 2}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {/* Phân trang Server-side */}
          <AdminPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            pageSize={pagination.size}
            onPageChange={onPageChange}
            onPageSizeChange={onSizeChange}
          />
        </div>
      )}

      {selectedBookingId && (
        <AdminBookingDetailModal
          isOpen={true}
          bookingId={selectedBookingId}
          onClose={() => setSelectedBookingId(null)}
          onConfirmPayment={onConfirmPayment}
          onAssignBuddy={onAssignBuddy}
        />
      )}
    </div>
  )
}