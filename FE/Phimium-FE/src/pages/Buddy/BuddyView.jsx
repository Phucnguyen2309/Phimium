import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from 'antd'

import { LanguageSwitcher } from '@/components/common/LanguageSwitcher.jsx'
import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'
import { formatDateTime } from '@/utils/format.js'

import { BuddySidebar } from './components/BuddySidebar.jsx'
import { BuddyTourMembersModal } from './components/BuddyTourMembersModal.jsx'
import { StarRating } from './components/StarRating.jsx'

export function BuddyView({
  activeTab = 'SCHEDULES',
  setActiveTab,
  scheduleFilter = 'ALL',
  setScheduleFilter,
  buddyStatus = 'ACTIVE',
  statusLoading = false,
  statusError = null,
  handleToggleStatus,
  schedules = [],
  allSchedules = [],
  feedbacks = [],
  stats = {},
  loading = false,
  refreshing = false,
  error = null,
  refreshDashboard,
  selectedDeparture = null,
  members = [],
  loadingMembers = false,
  membersError = null,
  openMembersModal,
  closeMembersModal,
  refreshMembers,
  handleCheckInMember,
  hasBuddyId = true,
  user,
}) {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const isAvailable = buddyStatus === 'ACTIVE'

  const handleConfirmLogout = async () => {
    setIsLogoutModalOpen(false)
    try {
      await logout?.()
    } finally {
      navigate(ROUTES.login, { replace: true, state: {} })
    }
  }

  const pageTitle =
    activeTab === 'SCHEDULES'
      ? isVi ? 'Lịch dẫn tour' : 'Tour Schedules'
      : isVi ? 'Đánh giá từ khách' : 'Guest Reviews'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ── 1. SIDEBAR TRÁI (Fixed, Collapsible trên desktop, Drawer trên mobile) ── */}
      <BuddySidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onLogout={() => setIsLogoutModalOpen(true)}
        scheduleCount={allSchedules.length}
        feedbackCount={feedbacks.length}
        user={user}
        isAvailable={isAvailable}
      />

      {/* ── 2. KHU VỰC NỘI DUNG CHÍNH (Trượt lề trái theo Sidebar trên desktop, ml-0 trên mobile) ── */}
      <div
        className={`flex min-h-screen flex-1 flex-col min-w-0 transition-[margin] duration-300 ease-in-out ml-0 ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        {/* Top Navbar Header Tinh Gọn */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-3.5 sm:px-6 backdrop-blur-md">
          {/* Left: Mobile Hamburger + Desktop Collapse Toggle + Current Page Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Button for Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"
              aria-label="Open mobile menu"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden md:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 active:scale-95"
              title={isSidebarCollapsed ? (isVi ? 'Mở rộng sidebar' : 'Expand sidebar') : (isVi ? 'Thu gọn sidebar' : 'Collapse sidebar')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            <h1 className="text-sm sm:text-base font-black tracking-tight text-blue-950 truncate">
              {pageTitle}
            </h1>
          </div>

          {/* Right: Controls tiện ích thiết thực */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Status Switcher Pill */}
            <div className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1 pl-2 sm:pl-2.5 shadow-2xs">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-700">
                {isAvailable
                  ? isVi ? 'Sẵn sàng nhận tour' : 'Available for tours'
                  : isVi ? 'Tạm nghỉ' : 'On break'}
              </span>

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={statusLoading}
                className={`rounded-lg px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-bold transition disabled:opacity-50 ${
                  isAvailable
                    ? 'bg-white text-rose-600 shadow-2xs border border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                }`}
              >
                {statusLoading
                  ? '...'
                  : isAvailable
                    ? isVi ? 'Tạm nghỉ' : 'Pause'
                    : isVi ? 'Bật nhận ca' : 'Go Active'}
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={refreshDashboard}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${refreshing || loading ? 'animate-spin text-blue-950' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
              <span className="hidden sm:inline">{refreshing || loading ? (isVi ? 'Đang tải...' : 'Loading...') : (isVi ? 'Làm mới' : 'Refresh')}</span>
            </button>

            {/* Language Switcher */}
            <LanguageSwitcher variant="pill" />
          </div>
        </header>

        {/* ── 3. KHU VỰC NỘI DUNG CHÍNH ── */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">

          {/* Status Error Alert if any */}
          {statusError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-800 shadow-2xs">
              {statusError}
            </div>
          )}

          {!hasBuddyId && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 shadow-2xs">
              {isVi
                ? 'Tài khoản chưa liên kết hồ sơ Buddy. Vui lòng liên hệ ban quản trị để được hỗ trợ.'
                : 'Your account is not linked to a Buddy profile. Please contact the administrator for assistance.'}
            </div>
          )}

          {/* ── METRICS STRIP (Khối thống kê chỉ số tinh tế) ── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100 grid grid-cols-2 lg:grid-cols-4 overflow-hidden">
            {/* Stat 1: Upcoming */}
            <div className="p-3.5 sm:p-5 lg:p-6 transition hover:bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isVi ? 'Ca sắp tới' : 'Upcoming Tours'}
                </span>
                <span className="h-2 w-2 rounded-full bg-blue-500" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-blue-950">
                {stats.upcomingTours ?? 0}
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
                {isVi ? 'Chờ khởi hành' : 'Awaiting departure'}
              </div>
            </div>

            {/* Stat 2: In Progress */}
            <div className="p-3.5 sm:p-5 lg:p-6 transition hover:bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isVi ? 'Đang diễn ra' : 'In Progress'}
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-emerald-600">
                {stats.inProgressTours ?? 0}
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
                {isVi ? 'Ca tour hiện hành' : 'Active tour sessions'}
              </div>
            </div>

            {/* Stat 3: Total Guests */}
            <div className="p-3.5 sm:p-5 lg:p-6 transition hover:bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isVi ? 'Tổng lượt khách' : 'Total Guests'}
                </span>
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-blue-950">
                {stats.totalGuests ?? 0}
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
                {isVi ? 'Khách trong các đoàn' : 'Participants served'}
              </div>
            </div>

            {/* Stat 4: Average Rating */}
            <div className="p-3.5 sm:p-5 lg:p-6 transition hover:bg-slate-50/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isVi ? 'Đánh giá trung bình' : 'Average Rating'}
                </span>
                <span className="text-amber-500 font-bold text-xs">★</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  {stats.avgRating || '5.0'}
                </span>
                <span className="text-xs font-medium text-slate-400">/ 5.0</span>
              </div>
              <div className="mt-1 text-[11px] sm:text-xs text-slate-400">
                {isVi
                  ? `${stats.reviewCount ?? 0} lượt phản hồi`
                  : `${stats.reviewCount ?? 0} reviews`}
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT CARD ── */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
            {/* Header thanh lọc & điều khiển */}
            <div className="border-b border-slate-100 bg-slate-50/70 px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {activeTab === 'SCHEDULES'
                    ? isVi ? 'Danh sách ca tour được giao' : 'Assigned Tour Departures'
                    : isVi ? 'Đánh giá & Nhận xét từ khách' : 'Guest Reviews & Feedback'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === 'SCHEDULES'
                    ? isVi
                      ? `Hiển thị ${schedules.length} ca tour theo bộ lọc hiện tại`
                      : `Showing ${schedules.length} departures for current filter`
                    : isVi
                      ? `Tổng cộng ${feedbacks.length} lượt nhận xét sau chuyến đi`
                      : `Total of ${feedbacks.length} reviews after tours`}
                </p>
              </div>

              {/* Bộ lọc trạng thái (chỉ hiện khi ở tab Lịch tour) */}
              {activeTab === 'SCHEDULES' && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {[
                    { key: 'ALL', label: isVi ? 'Tất cả' : 'All' },
                    { key: 'UPCOMING', label: isVi ? 'Sắp tới' : 'Upcoming' },
                    { key: 'IN_PROGRESS', label: isVi ? 'Đang diễn ra' : 'In Progress' },
                    { key: 'COMPLETED', label: isVi ? 'Đã hoàn thành' : 'Completed' },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setScheduleFilter(f.key)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition ${
                        scheduleFilter === f.key
                          ? 'bg-blue-950 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nội dung chi tiết */}
            <div className="p-3.5 sm:p-6">
              {/* TAB 1: SCHEDULES */}
              {activeTab === 'SCHEDULES' && (
                <>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  ) : error ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
                      <p className="text-sm font-semibold text-rose-700">
                        {isVi ? 'Không thể tải lịch trình ca tour' : 'Failed to load tour schedules'}
                      </p>
                      <button
                        type="button"
                        onClick={refreshDashboard}
                        className="mt-3 text-xs font-bold text-rose-800 underline hover:no-underline"
                      >
                        {isVi ? 'Nhấn để tải lại' : 'Click to retry'}
                      </button>
                    </div>
                  ) : schedules.length === 0 ? (
                    <div className="py-14 px-4 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-slate-800">
                        {isVi
                          ? 'Không có ca tour nào trong mục này'
                          : 'No tour departures found in this category'}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                        {isVi
                          ? 'Khi quản trị viên phân công ca tour mới, lịch trình và sĩ số đoàn khách sẽ hiển thị tại đây.'
                          : 'When the administrator assigns new tours, schedules and guest rosters will appear here.'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 -my-2">
                      {schedules.map((dep) => {
                        const isOngoing = dep.status === 'IN_PROGRESS'
                        const isDone = dep.status === 'COMPLETED'
                        const checkedIn = dep.checkedInCount ?? 0
                        const total = dep.totalGuests ?? 0
                        const percent = total > 0 ? Math.min(100, Math.round((checkedIn / total) * 100)) : 0

                        return (
                          <div
                            key={dep.departureId}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition hover:bg-slate-50/50 rounded-xl px-1 sm:px-2"
                          >
                            {/* Date Badge + Tour Info */}
                            <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="flex flex-col items-center justify-center h-13 w-13 sm:h-14 sm:w-14 rounded-xl border border-slate-200 bg-white shadow-2xs shrink-0">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  {dep.departureDate
                                    ? isVi
                                      ? dep.departureDate.split('-')[1] ? `Th${dep.departureDate.split('-')[1]}` : 'Ngày'
                                      : dep.departureDate.split('-')[1] ? `M${dep.departureDate.split('-')[1]}` : 'Day'
                                    : 'Tour'}
                                </span>
                                <span className="text-base sm:text-lg font-black text-blue-950">
                                  {dep.departureDate ? dep.departureDate.split('-')[2] || '--' : '--'}
                                </span>
                              </div>

                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                                  {isOngoing ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      {isVi ? 'Đang diễn ra' : 'In Progress'}
                                    </span>
                                  ) : isDone ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                                      {isVi ? 'Đã kết thúc' : 'Completed'}
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                      {isVi ? 'Sắp tới' : 'Upcoming'}
                                    </span>
                                  )}

                                  <span className="font-mono text-xs font-semibold text-slate-700">
                                    {String(dep.startTime || '').slice(0, 5)} – {String(dep.endTime || '').slice(0, 5)}
                                  </span>
                                  {dep.departureDate && dep.departureDate.includes('-') && (
                                    <span className="font-mono text-xs text-slate-400">
                                      ({dep.departureDate.split('-')[2]}-{dep.departureDate.split('-')[1]}-{dep.departureDate.split('-')[0]})
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm font-bold text-slate-900 truncate">
                                  {dep.activityTitle || (isVi ? 'Chuyến tham quan' : 'Tour Activity')}
                                </h3>

                                {dep.location && (
                                  <p className="text-xs text-slate-500 truncate">
                                    {isVi ? 'Điểm hẹn:' : 'Meeting Point:'}{' '}
                                    <span className="text-slate-700 font-medium">{dep.location}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            {/* Guest Progress & Action */}
                            <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                              <div className="text-left sm:text-right min-w-[90px] sm:min-w-[110px]">
                                <div className="text-[11px] font-medium text-slate-400">
                                  {isVi ? 'Sĩ số đoàn:' : 'Guest Roster:'}{' '}
                                  <span className="font-bold text-slate-800">{checkedIn}/{total}</span>
                                </div>
                                <div className="mt-1.5 h-1.5 w-20 sm:w-24 sm:ml-auto rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-300 ${
                                      percent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => openMembersModal(dep)}
                                className="rounded-xl border border-slate-200 bg-white px-3 sm:px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs transition hover:bg-blue-950 hover:text-white hover:border-blue-950 active:scale-95 shrink-0"
                              >
                                {isVi ? 'Danh sách đoàn' : 'Guest Roster'}
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </>
              )}

              {/* TAB 2: REVIEWS */}
              {activeTab === 'REVIEWS' && (
                <>
                  {feedbacks.length === 0 ? (
                    <div className="py-14 px-4 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                        </svg>
                      </div>
                      <h3 className="mt-3 text-sm font-bold text-slate-800">
                        {isVi ? 'Chưa có phản hồi nào từ khách hàng' : 'No guest reviews yet'}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                        {isVi
                          ? 'Đánh giá và ý kiến đóng góp từ người tham gia sẽ được tổng hợp tại đây sau mỗi chuyến đi.'
                          : 'Ratings and feedback from participants will be summarized here after each tour.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {feedbacks.map((fb, idx) => (
                        <div
                          key={fb.feedbackId || idx}
                          className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5 space-y-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="text-sm font-bold text-slate-900">
                                {fb.reviewerName || (isVi ? 'Khách trải nghiệm' : 'Participant')}
                              </span>
                              {fb.activityTitle && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  {isVi ? 'Tour:' : 'Tour:'}{' '}
                                  <span className="font-medium text-slate-700">{fb.activityTitle}</span>
                                </div>
                              )}
                            </div>
                            {fb.createdAt && (
                              <span className="text-[11px] text-slate-400">
                                {formatDateTime(fb.createdAt)}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                            <div className="rounded-lg bg-white p-3 border border-slate-200/60 shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-500">
                                  {isVi ? 'Chất lượng tour' : 'Tour Experience'}
                                </span>
                                <StarRating rating={fb.tripRating || 0} />
                              </div>
                              <p className="text-slate-700 italic">
                                {fb.tripComment ? `"${fb.tripComment}"` : (isVi ? 'Không có nhận xét chi tiết.' : 'No detailed feedback.')}
                              </p>
                            </div>

                            <div className="rounded-lg bg-white p-3 border border-slate-200/60 shadow-2xs space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-500">
                                  {isVi ? 'Thái độ phục vụ của Buddy' : 'Buddy Service'}
                                </span>
                                <StarRating rating={fb.buddyRating || 0} />
                              </div>
                              <p className="text-slate-700 font-medium">
                                {fb.buddyComment ? `"${fb.buddyComment}"` : (isVi ? 'Không có nhận xét chi tiết.' : 'No detailed feedback.')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── 4. MODAL DANH SÁCH ĐOÀN ── */}
      <BuddyTourMembersModal
        isOpen={Boolean(selectedDeparture)}
        onClose={closeMembersModal}
        departure={selectedDeparture}
        members={members}
        loading={loadingMembers}
        error={membersError}
        onRefresh={refreshMembers}
        onCheckIn={handleCheckInMember}
      />

      {/* ── 5. MODAL XÁC NHẬN ĐĂNG XUẤT ── */}
      <Modal
        open={isLogoutModalOpen}
        title={isVi ? 'Xác nhận đăng xuất' : 'Confirm Sign Out'}
        okText={isVi ? 'Đăng xuất' : 'Sign Out'}
        cancelText={isVi ? 'Hủy' : 'Cancel'}
        okButtonProps={{ danger: true }}
        onOk={handleConfirmLogout}
        onCancel={() => setIsLogoutModalOpen(false)}
        centered
        width={400}
      >
        <p className="text-sm leading-6 text-slate-600">
          {isVi
            ? 'Bạn có chắc chắn muốn đăng xuất khỏi Cổng Điều Hành Buddy?'
            : 'Are you sure you want to sign out of the Buddy Workspace?'}
        </p>
      </Modal>
    </div>
  )
}
