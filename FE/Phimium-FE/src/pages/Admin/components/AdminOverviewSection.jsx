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
          dotClass: 'bg-amber-500 animate-ping',
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
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isVi ? 'Tổng doanh thu' : 'Total Revenue'}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              💰
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {formatMoney(totalRevenue)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span>●</span>
            <span>{isVi ? 'Doanh thu từ các tour thành công' : 'Revenue from successful tours'}</span>
          </div>
        </div>

        {/* Lượt đặt tour */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isVi ? 'Lượt đặt tour' : 'Total Bookings'}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
              🎫
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {totalBookings}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span>{isVi ? 'Tổng số đơn đặt trên hệ thống' : 'Total reservations in system'}</span>
          </div>
        </div>

        {/* Khách hàng */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isVi ? 'Khách hàng' : 'Customers'}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              👥
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {totalUsers}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <span>{isVi ? 'Tài khoản khách đăng ký' : 'Registered user accounts'}</span>
          </div>
        </div>

        {/* Buddy hoạt động */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {isVi ? 'Đội ngũ Buddy' : 'Active Buddies'}
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              🤝
            </span>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-blue-950">
            {activeBuddies}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span>{isVi ? 'Đang sẵn sàng nhận dẫn tour' : 'Ready to guide tours'}</span>
          </div>
        </div>
      </div>

      {/* 2. CÁC TÁC VỤ CẦN XỬ LÝ NGAY (Actionable Operational Widgets) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Đơn chờ thanh toán */}
        <div className="flex items-center justify-between rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">{isVi ? 'Đơn chờ thanh toán' : 'Pending Payments'}</p>
              <p className="text-xl font-black text-amber-950">
                {isVi ? `${pendingPayments} đơn` : `${pendingPayments} bookings`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab(ADMIN_TABS.bookings)}
            className="rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-amber-700 active:scale-95"
          >
            {isVi ? 'Kiểm tra ngay →' : 'Check Now →'}
          </button>
        </div>

        {/* Đơn chờ ghép Buddy */}
        <div
          className={`flex items-center justify-between rounded-2xl border p-5 transition-all duration-300 ${
            waitingForBuddyCount > 0
              ? 'border-rose-300 bg-rose-50/70 shadow-sm ring-2 ring-rose-200/50'
              : 'border-blue-200/80 bg-blue-50/50'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-xl transition ${
                waitingForBuddyCount > 0
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200 animate-pulse'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {waitingForBuddyCount > 0 ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className={`text-xs font-bold ${waitingForBuddyCount > 0 ? 'text-rose-900' : 'text-blue-900'}`}>
                  {isVi ? 'Đơn chờ xếp Buddy' : 'Waiting for Buddy'}
                </p>
                {waitingForBuddyCount > 0 && (
                  <span className="inline-flex items-center rounded-full bg-rose-200/80 px-1.5 py-0.5 text-[10px] font-extrabold text-rose-800 animate-pulse">
                    {isVi ? 'Cần xử lý' : 'Action needed'}
                  </span>
                )}
              </div>
              <p className={`text-xl font-black ${waitingForBuddyCount > 0 ? 'text-rose-950' : 'text-blue-950'}`}>
                {isVi ? `${waitingForBuddyCount} đơn` : `${waitingForBuddyCount} bookings`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab(ADMIN_TABS.bookings)}
            className={`rounded-xl px-3.5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 ${
              waitingForBuddyCount > 0
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-blue-950 hover:bg-blue-900'
            }`}
          >
            {isVi ? 'Gán Buddy ngay →' : 'Assign Buddy →'}
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
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-blue-950 transition hover:bg-slate-100 shadow-sm"
                        >
                          <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{isVi ? 'Xem' : 'View'}</span>
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