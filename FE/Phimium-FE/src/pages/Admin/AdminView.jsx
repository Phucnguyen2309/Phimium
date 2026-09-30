import { useState } from 'react'
import { ADMIN_TABS } from '@/constants/admin.js'
import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'

import { AdminActivitiesSection } from './components/AdminActivitiesSection.jsx'
import { AdminAssignBuddyModal } from './components/AdminAssignBuddyModal.jsx'
import { AdminBookingsSection } from './components/AdminBookingsSection.jsx'
import { AdminBuddiesSection } from './components/AdminBuddiesSection.jsx'
import { AdminConfirmModal } from './components/AdminConfirmModal.jsx'
import { AdminCouponModal } from './components/AdminCouponModal.jsx'
import { AdminCouponsSection } from './components/AdminCouponsSection.jsx'
import { AdminCreateActivityModal } from './components/AdminCreateActivityModal.jsx'
import { AdminFeedbacksSection } from './components/AdminFeedbacksSection.jsx'
import { AdminOverviewSection } from './components/AdminOverviewSection.jsx'
import { AdminPaymentsSection } from './components/AdminPaymentsSection.jsx'
import { AdminSidebar } from './components/AdminSidebar.jsx'
import { AdminToastNotification } from './components/AdminToastNotification.jsx'
import { AdminUsersSection } from './components/AdminUsersSection.jsx'
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher.jsx'

const GET_TAB_TITLES = (isVi) => ({
  [ADMIN_TABS.overview]: 'Dashboard',
  [ADMIN_TABS.activities]: isVi ? 'Quản lý Tour & Hoạt động' : 'Manage Tours & Activities',
  [ADMIN_TABS.bookings]: isVi ? 'Quản lý Đơn đặt chỗ' : 'Manage Bookings',
  [ADMIN_TABS.buddies]: isVi ? 'Quản lý Hướng dẫn viên (Buddy)' : 'Manage Tour Guides (Buddies)',
  [ADMIN_TABS.users]: isVi ? 'Quản lý Người dùng' : 'Manage Users',
  [ADMIN_TABS.coupons]: isVi ? 'Quản lý Mã giảm giá (Coupon)' : 'Manage Discount Coupons',
  [ADMIN_TABS.payments]: isVi ? 'Quản lý Hóa đơn & Giao dịch' : 'Manage Invoices & Transactions',
  [ADMIN_TABS.feedbacks]: isVi ? 'Quản lý Đánh giá & Phản hồi' : 'Manage Reviews & Feedback',
})

export function AdminView({
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
  handleSelectTab,
  refreshCurrentTab,
  handleUpdateBuddyStatus,
  handleApproveBuddy,
  handleRejectBuddy,
  handleConfirmPayment,
  handleAssignBuddy,
  handleToggleUserStatus,
  handleCreateCoupon,
  handleToggleCouponStatus,
  handleDeleteFeedback,
  assignBuddyModal,
  handleCloseAssignBuddy,
  handleDoAssignBuddy,

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
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'
  const tabTitles = GET_TAB_TITLES(isVi)
  const { logout } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false)
    showToast?.({
      type: 'info',
      title: isVi ? 'Đăng xuất' : 'Sign Out',
      message: isVi ? 'Đang đăng xuất khỏi hệ thống...' : 'Signing out of the system...',
    })
    setTimeout(() => {
      logout?.()
    }, 400)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* 1. SIDEBAR TRÁI: Cố định 100% theo chiều cao màn hình (viewport) */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onLogout={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI: Tự động trượt margin-left theo chiều rộng sidebar */}
      <div
        className={`flex min-h-screen flex-1 flex-col min-w-0 transition-[margin] duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Top Navbar Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 active:scale-95"
              title={isSidebarCollapsed ? (isVi ? 'Mở rộng sidebar' : 'Expand sidebar') : (isVi ? 'Thu gọn sidebar' : 'Collapse sidebar')}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <h1 className="text-base font-black tracking-tight text-blue-950">
              {tabTitles[activeTab] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Chuyển đổi ngôn ngữ Anh - Việt */}
            <LanguageSwitcher variant="pill" />

            {/* Nút Làm mới dữ liệu */}
            <button
              type="button"
              onClick={refreshCurrentTab}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:opacity-50"
            >
              <svg
                className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`}
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
              <span>{loading ? (isVi ? 'Đang tải...' : 'Loading...') : (isVi ? 'Làm mới' : 'Refresh')}</span>
            </button>

            {/* Profile Avatar Pill: Dùng Logo Phimium + chữ Admin (Không dùng email) */}
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-950 shadow-inner">
                <svg viewBox="0 0 32 32" className="h-3.5 w-3.5" aria-hidden="true">
                  <path
                    d="M10 26V7h8.2c4.3 0 7 2.4 7 6.1s-2.7 6.2-7 6.2H14.6"
                    fill="none"
                    stroke="white"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="19" cy="13.1" r="2.3" fill="#facc15" />
                </svg>
              </div>
              <span className="text-xs font-bold text-slate-800">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Nội dung từng tab */}
        <main className="flex-1 p-6 lg:p-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 text-xs font-semibold text-rose-700 shadow-sm">
              {t('admin.common.loadError')}
            </div>
          )}

          {activeTab === ADMIN_TABS.overview && (
            <AdminOverviewSection
              data={dashboardData}
              activities={activities}
              loading={loading}
              onNavigateTab={handleSelectTab}
            />
          )}

          {activeTab === ADMIN_TABS.activities && (
            <AdminActivitiesSection
              activities={activities}
              loading={loading}
              onOpenCreateModal={() => setIsActivityModalOpen?.(true)}
              onUpdateActivity={handleUpdateActivity}
              onDeleteActivity={handleDeleteActivity}
              onRefresh={refreshCurrentTab}
            />
          )}

          {activeTab === ADMIN_TABS.bookings && (
            <AdminBookingsSection
              bookings={bookings}
              loading={loading}
              actionLoading={actionLoading}
              filters={bookingFilters}
              pagination={bookingPagination}
              onPageChange={handleBookingPageChange}
              onSizeChange={handleBookingSizeChange}
              onFiltersChange={handleBookingFiltersChange}
              onConfirmPayment={handleConfirmPayment}
              onAssignBuddy={handleAssignBuddy}
            />
          )}

          {activeTab === ADMIN_TABS.buddies && (
            <AdminBuddiesSection
              buddies={buddies}
              loading={loading}
              actionLoading={actionLoading}
              filters={buddyFilters}
              onFiltersChange={handleBuddyFiltersChange}
              onApprove={handleApproveBuddy}
              onReject={handleRejectBuddy}
              onUpdateStatus={handleUpdateBuddyStatus}
            />
          )}

          {activeTab === ADMIN_TABS.users && (
            <AdminUsersSection
              users={users}
              loading={loading}
              actionLoading={actionLoading}
              filters={userFilters}
              pagination={userPagination}
              onPageChange={handleUserPageChange}
              onSizeChange={handleUserSizeChange}
              onFiltersChange={handleUserFiltersChange}
              onToggleStatus={handleToggleUserStatus}
            />
          )}

          {activeTab === ADMIN_TABS.coupons && (
            <AdminCouponsSection
              coupons={coupons}
              loading={loading}
              actionLoading={actionLoading}
              onOpenCreateModal={handleOpenCreateCoupon}
              onEditCoupon={handleOpenEditCoupon}
              onDeleteCoupon={handleToggleCouponStatus}
            />
          )}

          {activeTab === ADMIN_TABS.payments && (
            <AdminPaymentsSection
              payments={payments}
              loading={loading}
              filters={paymentFilters}
              pagination={paymentPagination}
              onPageChange={handlePaymentPageChange}
              onSizeChange={handlePaymentSizeChange}
              onFiltersChange={handlePaymentFiltersChange}
            />
          )}

          {activeTab === ADMIN_TABS.feedbacks && (
            <AdminFeedbacksSection
              feedbacks={feedbacks}
              loading={loading}
              actionLoading={actionLoading}
              filters={feedbackFilters}
              pagination={feedbackPagination}
              onPageChange={handleFeedbackPageChange}
              onSizeChange={handleFeedbackSizeChange}
              onFiltersChange={handleFeedbackFiltersChange}
              onDeleteFeedback={handleDeleteFeedback}
            />
          )}
        </main>
      </div>

      {/* Floating Popup Toast Thông Báo Thành Công / Thất Bại */}
      <AdminToastNotification toast={toast} onClose={hideToast} />

      {/* Popup Modal Xác Nhận Đăng Xuất */}
      <AdminConfirmModal
        isOpen={isLogoutModalOpen}
        title={isVi ? 'Xác nhận đăng xuất' : 'Confirm Sign Out'}
        message={
          isVi
            ? 'Bạn có chắc chắn muốn đăng xuất tài khoản Quản trị viên khỏi hệ thống không?'
            : 'Are you sure you want to sign out of the Administrator account?'
        }
        confirmText={isVi ? 'Đăng xuất' : 'Sign Out'}
        cancelText={isVi ? 'Ở lại' : 'Stay'}
        isDestructive={true}
        onConfirm={handleConfirmLogout}
        onClose={() => setIsLogoutModalOpen(false)}
      />

      {/* Modal Tạo Tour Mới */}
      <AdminCreateActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen?.(false)}
        onSubmit={handleCreateActivity}
        actionLoading={actionLoading}
      />

      {/* Modal Tạo / Chỉnh sửa Coupon */}
      <AdminCouponModal
        isOpen={isCouponModalOpen}
        initialData={editingCoupon}
        onClose={handleCloseCouponModal || (() => setIsCouponModalOpen(false))}
        onSubmit={handleSaveCoupon || handleCreateCoupon}
        actionLoading={actionLoading}
      />

      {/* Modal Gán Buddy */}
      <AdminAssignBuddyModal
        isOpen={assignBuddyModal?.isOpen}
        candidates={assignBuddyModal?.candidates ?? []}
        loading={assignBuddyModal?.loading}
        actionLoading={actionLoading}
        onAssign={handleDoAssignBuddy}
        onClose={handleCloseAssignBuddy}
      />
    </div>
  )
}