import { useState } from 'react'
import { ADMIN_TABS } from '@/constants/admin.js'
import { useLanguage } from '@/context/languageContext.js'
import { formatDateTime, formatMoney } from '@/utils/format.js'
import { AdminBookingDetailModal } from './AdminBookingDetailModal.jsx'

export function AdminOverviewSection({
  data,
  activities = [],
  loading = false,
  onNavigateTab,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'
  const [selectedBookingId, setSelectedBookingId] = useState(null)

  const getStatusInfo = (status) => {
    switch (status) {
      case 'COMPLETED':
        return {
          label: isVi ? 'Hoàn thành' : 'Completed',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500',
        }
      case 'CONFIRMED':
        return {
          label: isVi ? 'Đã xác nhận' : 'Confirmed',
          badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
          dotClass: 'bg-blue-500',
        }
      case 'BUDDY_ASSIGNED':
        return {
          label: isVi ? 'Đã có Buddy' : 'Buddy Assigned',
          badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          dotClass: 'bg-indigo-500',
        }
      case 'WAITING_FOR_BUDDY':
        return {
          label: isVi ? 'Chờ ghép Buddy' : 'Waiting for Buddy',
          badgeClass: 'bg-amber-50 text-amber-900 border-amber-300 font-bold',
          dotClass: 'bg-amber-500',
        }
      case 'PENDING_PAYMENT':
        return {
          label: isVi ? 'Chờ thanh toán' : 'Pending Payment',
          badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200',
          dotClass: 'bg-yellow-500',
        }
      case 'PAYMENT_REVIEW':
        return {
          label: isVi ? 'Chờ kiểm tra GD' : 'Payment Review',
          badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
          dotClass: 'bg-sky-500',
        }
      case 'IN_PROGRESS':
        return {
          label: isVi ? 'Đang diễn ra' : 'In Progress',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500',
        }
      case 'CANCELLED':
        return {
          label: isVi ? 'Đã hủy' : 'Cancelled',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500',
        }
      default:
        return {
          label: status?.replace(/_/g, ' ') || (isVi ? 'Chờ xử lý' : 'Pending'),
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          dotClass: 'bg-slate-400',
        }
    }
  }

  // 1. Dữ liệu thực tế 100% từ API Dashboard Summary
  const totalRevenue = Number(data?.totalRevenue ?? 0)
  const totalBookings = Number(data?.totalBookings ?? 0)
  const totalUsers = Number(data?.totalUsers ?? 0)
  const activeBuddies = Number(data?.activeBuddies ?? data?.totalBuddies ?? 0)
  const pendingPayments = Number(data?.pendingPayments ?? 0)
  const waitingForBuddyCount = Number(data?.waitingForBuddyCount ?? 0)

  const recentBookings = data?.recentRegistrations || []
  const hasBookings = recentBookings.length > 0
  const realActivities = (activities || []).filter(Boolean).slice(0, 4)

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
        <div className="flex flex-col items-center gap-2.5">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">
            {isVi ? 'Đang tải dữ liệu tổng quan...' : 'Loading overview data...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. HÀNG 4 THẺ CHỈ SỐ KPI CHÍNH */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Doanh thu */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isVi ? 'Tổng doanh thu' : 'Total Revenue'}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {formatMoney(totalRevenue)}
          </p>
          <p className="mt-2 text-[11px] font-medium text-emerald-600">
            {isVi ? 'Doanh thu từ các tour thành công' : 'Revenue from successful tours'}
          </p>
        </div>

        {/* Lượt đặt tour */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isVi ? 'Lượt đặt tour' : 'Total Bookings'}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {totalBookings}
          </p>
          <p className="mt-2 text-[11px] font-medium text-slate-400">
            {isVi ? 'Tổng số đơn đặt trên hệ thống' : 'Total reservations in system'}
          </p>
        </div>

        {/* Khách hàng */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isVi ? 'Khách hàng' : 'Customers'}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {totalUsers}
          </p>
          <p className="mt-2 text-[11px] font-medium text-slate-400">
            {isVi ? 'Tài khoản khách đăng ký' : 'Registered user accounts'}
          </p>
        </div>

        {/* Buddy hoạt động */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:border-slate-300">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isVi ? 'Đội ngũ Buddy' : 'Active Buddies'}
          </p>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {activeBuddies}
          </p>
          <p className="mt-2 text-[11px] font-medium text-emerald-600">
            {isVi ? 'Đang sẵn sàng nhận dẫn tour' : 'Ready to guide tours'}
          </p>
        </div>
      </div>

      {/* 2. CÁC TÁC VỤ CẦN XỬ LÝ (Actionable Operational Widgets) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Đơn chờ thanh toán */}
        <div className="flex items-center justify-between rounded-2xl border border-amber-200/70 bg-amber-50/40 p-5">
          <div>
            <p className="text-xs font-bold text-amber-900">{isVi ? 'Đơn chờ thanh toán' : 'Pending Payments'}</p>
            <p className="mt-1 text-2xl font-black text-amber-950">
              {isVi ? `${pendingPayments} đơn` : `${pendingPayments} bookings`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab(ADMIN_TABS.bookings)}
            className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 active:scale-95"
          >
            {isVi ? 'Kiểm tra ngay' : 'Check Now'}
          </button>
        </div>

        {/* Đơn chờ ghép Buddy */}
        <div
          className={`flex items-center justify-between rounded-2xl border p-5 transition-all ${
            waitingForBuddyCount > 0
              ? 'border-rose-300 bg-rose-50/60'
              : 'border-slate-200/80 bg-white'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <p className={`text-xs font-bold ${waitingForBuddyCount > 0 ? 'text-rose-900' : 'text-slate-700'}`}>
                {isVi ? 'Đơn chờ xếp Buddy' : 'Waiting for Buddy'}
              </p>
              {waitingForBuddyCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                  {isVi ? 'Cần xử lý' : 'Action needed'}
                </span>
              )}
            </div>
            <p className={`mt-1 text-2xl font-black ${waitingForBuddyCount > 0 ? 'text-rose-950' : 'text-blue-950'}`}>
              {isVi ? `${waitingForBuddyCount} đơn` : `${waitingForBuddyCount} bookings`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab(ADMIN_TABS.bookings)}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 ${
              waitingForBuddyCount > 0
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-950 hover:bg-blue-900'
            }`}
          >
            {isVi ? 'Gán Buddy ngay' : 'Assign Buddy'}
          </button>
        </div>
      </div>

      {/* 3. BẢNG 5 ĐƠN ĐẶT CHỖ MỚI NHẤT (Dữ liệu thật 100% từ BE recentRegistrations) */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black tracking-tight text-blue-950">
              {isVi ? 'Đơn đặt chỗ mới nhất' : 'Recent Bookings'}
            </h2>
            <p className="text-xs text-slate-400">
              {isVi
                ? '5 giao dịch tour phát sinh gần đây nhất từ người dùng'
                : 'Latest 5 booking transactions from users'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab(ADMIN_TABS.bookings)}
            className="self-start text-xs font-bold text-blue-900 transition hover:text-blue-950 sm:self-auto"
          >
            {isVi
              ? `Xem tất cả đơn (${totalBookings}) →`
              : `View all bookings (${totalBookings}) →`}
          </button>
        </div>

        {!hasBookings ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-10 text-center">
            <p className="text-sm font-bold text-slate-600">
              {isVi ? 'Chưa có đơn đặt chỗ nào trong hệ thống' : 'No bookings in the system yet'}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {isVi
                ? 'Các đơn mới tạo sẽ tự động xuất hiện tại đây sau khi khách đăng ký.'
                : 'New bookings will automatically appear here once guests register.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pr-4">{isVi ? 'Mã đơn' : 'Booking Code'}</th>
                  <th className="pb-3 pr-4">{isVi ? 'Khách hàng' : 'Customer'}</th>
                  <th className="pb-3 pr-4">{isVi ? 'Hoạt động & Ca' : 'Activity & Slot'}</th>
                  <th className="pb-3 pr-4 text-right">{isVi ? 'Tổng tiền' : 'Total Amount'}</th>
                  <th className="pb-3 text-right">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="pb-3 pl-4 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBookings.map((booking) => {
                  const statusInfo = getStatusInfo(booking.status)
                  const bookingId = booking.id || booking.registrationId

                  return (
                    <tr
                      key={bookingId}
                      onClick={() => setSelectedBookingId(bookingId)}
                      className="cursor-pointer transition hover:bg-slate-50/80"
                    >
                      {/* Mã đơn */}
                      <td className="py-3.5 pr-4 font-mono text-xs font-bold text-blue-950">
                        {booking.invoiceNumber || booking.invoiceCode || (bookingId ? `#${String(bookingId).slice(0, 8).toUpperCase()}` : '—')}
                        {booking.createdAt && (
                          <p className="mt-0.5 font-sans text-[10px] font-normal text-slate-400">
                            {formatDateTime(booking.createdAt)}
                          </p>
                        )}
                      </td>

                      {/* Khách hàng */}
                      <td className="py-3.5 pr-4">
                        <p className="font-bold text-slate-900">
                          {booking.customerName || booking.userName || (isVi ? 'Khách vãng lai' : 'Guest')}
                        </p>
                        {booking.customerEmail && (
                          <p className="text-[11px] text-slate-400">
                            {booking.customerEmail}
                          </p>
                        )}
                      </td>

                      {/* Hoạt động */}
                      <td className="py-3.5 pr-4">
                        <p className="max-w-xs truncate font-semibold text-slate-800">
                          {booking.activityTitle || booking.activity?.title || (isVi ? 'Tour trải nghiệm' : 'Experience Tour')}
                        </p>
                        {booking.departureTime && (
                          <p className="text-[11px] text-slate-400">
                            {booking.departureTime}
                          </p>
                        )}
                      </td>

                      {/* Tổng tiền */}
                      <td className="py-3.5 pr-4 text-right font-black text-blue-950">
                        {formatMoney(booking.totalAmount || booking.amount || 0)}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${statusInfo.badgeClass}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${statusInfo.dotClass}`}
                          />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>

                      {/* Coi chi tiết */}
                      <td className="py-3.5 pl-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedBookingId(bookingId)}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-950 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
                        >
                          {isVi ? 'Xem' : 'View'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal chi tiết đơn đặt chỗ khi click vào đơn ở Dashboard */}
        {selectedBookingId && (
          <AdminBookingDetailModal
            isOpen={true}
            bookingId={selectedBookingId}
            onClose={() => setSelectedBookingId(null)}
          />
        )}
      </div>

      {/* 4. CÁC TOUR GẦN ĐÂY ĐANG MỞ BÁN */}
      {realActivities.length > 0 && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black tracking-tight text-blue-950">
                {isVi
                  ? `Tour đang mở bán (${activities.length})`
                  : `Active Tours (${activities.length})`}
              </h2>
              <p className="text-xs text-slate-400">
                {isVi
                  ? 'Các hoạt động trải nghiệm hiện có trên hệ thống'
                  : 'Current experiences available on system'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab(ADMIN_TABS.activities)}
              className="text-xs font-bold text-blue-900 transition hover:text-blue-950"
            >
              {isVi ? 'Quản lý tất cả tour →' : 'Manage all tours →'}
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {realActivities.map((act) => (
              <div
                key={act.id}
                onClick={() => onNavigateTab(ADMIN_TABS.activities)}
                className="group cursor-pointer rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:border-blue-950/30 hover:bg-white hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-blue-950/10 px-2 py-0.5 text-[10px] font-bold text-blue-950">
                    {act.activityType || 'Tour'}
                  </span>
                  {act.price > 0 && (
                    <span className="text-xs font-black text-blue-950">
                      {formatMoney(act.price)}
                    </span>
                  )}
                </div>
                <h3 className="mt-2 line-clamp-2 text-xs font-bold text-slate-900 group-hover:text-blue-900">
                  {act.title}
                </h3>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="truncate">{act.locationName || act.address}</span>
                  {act.departures?.length > 0 && (
                    <span className="font-semibold text-blue-950 shrink-0">
                      {act.departures.length} {isVi ? 'ca' : 'slots'}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}