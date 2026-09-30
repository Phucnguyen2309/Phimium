import { useEffect, useState } from 'react'
import adminService from '@/services/adminService.js'
import { formatMoney, formatDateTime } from '@/utils/format.js'
import { useLanguage } from '@/context/languageContext.js'

const GET_STATUS_MAP = (isVi) => ({
  PENDING_PAYMENT: { label: isVi ? 'Chờ thanh toán' : 'Pending Payment', cls: 'border-yellow-200 bg-yellow-50 text-yellow-800' },
  PAYMENT_REVIEW: { label: isVi ? 'Chờ xác nhận TT' : 'Payment Review', cls: 'border-amber-200 bg-amber-50 text-amber-800' },
  WAITING_FOR_BUDDY: { label: isVi ? 'Chờ ghép Buddy' : 'Waiting for Buddy', cls: 'border-orange-200 bg-orange-50 text-orange-800' },
  BUDDY_ASSIGNED: { label: isVi ? 'Đã có Buddy' : 'Buddy Assigned', cls: 'border-indigo-200 bg-indigo-50 text-indigo-700' },
  CONFIRMED: { label: isVi ? 'Đã xác nhận' : 'Confirmed', cls: 'border-blue-200 bg-blue-50 text-blue-700' },
  IN_PROGRESS: { label: isVi ? 'Đang diễn ra' : 'In Progress', cls: 'border-violet-200 bg-violet-50 text-violet-700' },
  COMPLETED: { label: isVi ? 'Hoàn thành' : 'Completed', cls: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  CANCELLED: { label: isVi ? 'Đã hủy' : 'Cancelled', cls: 'border-rose-200 bg-rose-50 text-rose-700' },
})

export function AdminBookingDetailModal({
  isOpen = true,
  bookingId,
  onClose,
  onConfirmPayment,
  onAssignBuddy,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !bookingId) {
      setData(null)
      setError('')
      return
    }

    let isMounted = true
    const fetchDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await adminService.getRegistrationById(bookingId)
        if (isMounted) {
          const detail = res?.data?.data ?? res?.data ?? res
          setData(detail)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Lỗi tải chi tiết đơn đặt chỗ:', err)
          setError(isVi ? 'Không thể tải chi tiết đơn hàng.' : 'Failed to load booking details.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDetail()
    return () => {
      isMounted = false
    }
  }, [isOpen, bookingId, isVi])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const booking = data?.booking ?? data
  const customer = data?.customer ?? null
  const statusMap = GET_STATUS_MAP(isVi)
  const statusInfo = statusMap[booking?.status] || {
    label: booking?.status || '—',
    cls: 'border-slate-200 bg-slate-100 text-slate-700',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-yellow-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black text-blue-950">
                {isVi ? 'Chi tiết đơn đặt chỗ' : 'Booking Details'}
              </h3>
              <p className="font-mono text-[11px] font-bold text-slate-400">
                {isVi ? 'Mã đơn / Hóa đơn:' : 'Booking / Invoice:'} {booking?.invoiceNumber || (bookingId ? `#${String(bookingId).slice(0, 8).toUpperCase()}` : '—')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[75vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-xs text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent mr-2" />
              {isVi ? 'Đang tải chi tiết đơn hàng...' : 'Loading booking details...'}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-xs text-rose-600">
              {error}
            </div>
          ) : booking ? (
            <div className="space-y-4">
              {/* Trạng thái đơn */}
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs">
                <span className="text-slate-500 font-medium">
                  {isVi ? 'Trạng thái đơn:' : 'Booking Status:'}
                </span>
                <span className={`inline-block rounded-full border px-3 py-0.5 font-bold ${statusInfo.cls}`}>
                  {statusInfo.label}
                </span>
              </div>

              {/* Thông tin khách hàng */}
              <div className="rounded-xl border border-slate-100 p-3.5">
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isVi ? 'Thông tin khách hàng' : 'Customer Information'}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">{isVi ? 'Họ tên:' : 'Full Name:'}</span>{' '}
                    <span className="font-bold text-slate-800">{customer?.fullName || (isVi ? 'Khách vãng lai' : 'Guest')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Email:</span>{' '}
                    <span className="font-medium text-slate-700">{customer?.email || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{isVi ? 'Số điện thoại:' : 'Phone Number:'}</span>{' '}
                    <span className="font-medium text-slate-700">{customer?.phone || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{isVi ? 'Điểm đón:' : 'Pickup Location:'}</span>{' '}
                    <span className="font-medium text-slate-700">{booking.pickupLocation || (isVi ? 'Tại điểm hẹn tour' : 'At tour meeting point')}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin hoạt động & ca khởi hành */}
              <div className="rounded-xl border border-slate-100 p-3.5">
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isVi ? 'Thông tin chuyến đi' : 'Trip Information'}
                </h4>
                <p className="font-bold text-blue-950 text-xs">
                  {booking.departure?.activity?.title || (isVi ? 'Tour trải nghiệm' : 'Tour Experience')}
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">{isVi ? 'Ngày khởi hành:' : 'Departure Date:'}</span>{' '}
                    <span className="font-semibold text-slate-700">{booking.departure?.departureDate || '—'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{isVi ? 'Khung giờ:' : 'Time Slot:'}</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {booking.departure?.startTime ? `${booking.departure.startTime} - ${booking.departure.endTime || ''}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">{isVi ? 'Số lượng:' : 'Quantity:'}</span>{' '}
                    <span className="font-semibold text-slate-700">
                      {booking.adultCount || 0} {isVi ? 'người lớn' : 'adults'} {booking.childCount > 0 ? `, ${booking.childCount} ${isVi ? 'trẻ em' : 'children'}` : ''}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">{isVi ? 'Buddy dẫn tour:' : 'Assigned Buddy:'}</span>{' '}
                    <span className="font-semibold text-blue-950">{booking.buddy?.name || (isVi ? 'Chưa gán Buddy' : 'Unassigned')}</span>
                  </div>
                </div>
              </div>

              {/* Thông tin thanh toán */}
              <div className="rounded-xl border border-slate-100 p-3.5">
                <h4 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {isVi ? 'Chi tiết thanh toán' : 'Payment Breakdown'}
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isVi ? 'Tạm tính:' : 'Subtotal:'}</span>
                    <span className="font-medium text-slate-700">{formatMoney(booking.subtotal || booking.totalAmount)}</span>
                  </div>
                  {booking.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>{isVi ? 'Giảm giá:' : 'Discount:'}</span>
                      <span>-{formatMoney(booking.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-100 pt-1.5 text-sm font-black text-blue-950">
                    <span>{isVi ? 'Tổng tiền thanh toán:' : 'Total Amount:'}</span>
                    <span>{formatMoney(booking.totalAmount)}</span>
                  </div>
                  {booking.paymentConfirmedAt && (
                    <p className="text-[11px] text-emerald-600 font-medium pt-1">
                      ✓ {isVi ? 'Đã xác nhận thanh toán lúc' : 'Payment confirmed at'} {formatDateTime(booking.paymentConfirmedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              {isVi ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
