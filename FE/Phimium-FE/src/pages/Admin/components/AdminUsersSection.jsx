import { useEffect, useMemo, useState } from 'react'

import { UserAvatar } from '@/components/common'
import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import { formatDateTime, formatDDMMYYYY, matchSearchText } from '@/utils/format.js'
import { AdminPagination } from './AdminPagination.jsx'
import { AdminUserDetailModal } from './AdminUserDetailModal.jsx'
import { AdminConfirmModal } from './AdminConfirmModal.jsx'
import { AdminUpgradeBuddyModal } from './AdminUpgradeBuddyModal.jsx'

export function AdminUsersSection({
  users = [],
  loading = false,
  actionLoading = false,
  filters = { page: 0, size: 10, keyword: '', role: '', status: '' },
  pagination = { page: 0, size: 10, totalPages: 1, totalElements: 0 },
  onPageChange,
  onSizeChange,
  onFiltersChange,
  onToggleStatus,
  onRefresh,
  showToast,
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'
  const { user: currentUser } = useAuth()
  const [searchTerm, setSearchTerm] = useState(filters?.keyword || '')
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [warningModal, setWarningModal] = useState({
    isOpen: false,
    user: null,
    isSelf: false,
  })
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    user: null,
  })
  const [upgradingUser, setUpgradingUser] = useState(null)
  const [localRoleOverrides, setLocalRoleOverrides] = useState({})

  // Sync searchTerm when filters change externally
  useEffect(() => {
    setSearchTerm(filters?.keyword || '')
  }, [filters?.keyword])

  // Debounce gửi keyword lên server khi người dùng dừng gõ 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() !== (filters?.keyword || '')) {
        onFiltersChange?.({ keyword: searchTerm.trim() })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Áp dụng vai trò mới tức thì (optimistic) cho UI
  const displayUsers = useMemo(() => {
    return users.map((u) => {
      const overrideRole = localRoleOverrides[u.id]
      return overrideRole ? { ...u, role: overrideRole } : u
    })
  }, [users, localRoleOverrides])

  // Lọc tức thì (instant) ở client hỗ trợ cả tiếng Việt có dấu và không dấu
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return displayUsers
    const term = searchTerm.trim()
    return displayUsers.filter(
      (u) =>
        matchSearchText(u.fullName, term) ||
        matchSearchText(u.email, term) ||
        matchSearchText(u.phone, term)
    )
  }, [displayUsers, searchTerm])

  // Đóng modal cảnh báo khi bấm phím ESC
  useEffect(() => {
    if (!warningModal.isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setWarningModal((prev) => ({ ...prev, isOpen: false }))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [warningModal.isOpen])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    onFiltersChange?.({ keyword: searchTerm.trim() })
  }

  const handleToggleClick = (u) => {
    const isSelf = Boolean(
      currentUser?.userId && String(currentUser.userId) === String(u.id),
    )
    const isAdmin = u.role === 'ADMIN'

    // Không cho phép ngưng hoạt động (status === 'ACTIVE') tài khoản ADMIN hoặc chính mình
    if (u.status === 'ACTIVE' && (isAdmin || isSelf)) {
      setWarningModal({
        isOpen: true,
        user: u,
        isSelf,
      })
      return
    }

    // Nếu ngưng hoạt động tài khoản BUDDY đang ACTIVE -> Cần hộp thoại cảnh báo rõ ràng
    if (u.status === 'ACTIVE' && u.role === 'BUDDY') {
      setConfirmModal({
        isOpen: true,
        user: u,
      })
      return
    }

    onToggleStatus?.(u.id, u.status, u.role, u.fullName)
  }

  // Label hiển thị vai trò: LUÔN GIỮ NGUYÊN TIẾNG ANH (ADMIN, BUDDY, USER) theo yêu cầu
  const getRoleLabel = (role) => {
    if (role === 'ADMIN') return 'ADMIN'
    if (role === 'BUDDY') return 'BUDDY'
    return 'USER'
  }

  // Label hiển thị trạng thái tài khoản (đồng bộ BE: ACTIVE / INACTIVE)
  const getStatusLabel = (status) => {
    if (status === 'ACTIVE') return isVi ? 'Đang hoạt động' : 'Active'
    return isVi ? 'Ngưng hoạt động' : 'Inactive'
  }

  return (
    <div className="space-y-4">
      {/* 1. THANH BỘ LỌC TÌM KIẾM & PHÂN LOẠI (Chuẩn Enum BE: USER, BUDDY, ADMIN | ACTIVE, INACTIVE) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        {/* Form tìm kiếm */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-sm flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onBlur={() => {
              if (searchTerm !== (filters?.keyword || '')) {
                onFiltersChange?.({ keyword: searchTerm })
              }
            }}
            placeholder={isVi ? 'Tìm theo tên, email, số điện thoại...' : 'Search by name, email, phone...'}
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
              onClick={() => {
                setSearchTerm('')
                onFiltersChange?.({ keyword: '' })
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </form>

        {/* Dropdowns lọc Role & Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Lọc Role: USER, BUDDY, ADMIN (Role luôn tiếng Anh) */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{isVi ? 'Vai trò:' : 'Role:'}</span>
            <select
              value={filters?.role || ''}
              onChange={(e) => onFiltersChange?.({ role: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
            >
              <option value="">{isVi ? 'Tất cả vai trò' : 'All Roles'}</option>
              <option value="USER">USER</option>
              <option value="BUDDY">BUDDY</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          {/* Lọc Status: ACTIVE, INACTIVE */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{isVi ? 'Trạng thái:' : 'Status:'}</span>
            <select
              value={filters?.status || ''}
              onChange={(e) => onFiltersChange?.({ status: e.target.value })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
            >
              <option value="">{isVi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
              <option value="ACTIVE">{isVi ? 'Đang hoạt động' : 'Active'}</option>
              <option value="INACTIVE">{isVi ? 'Ngưng hoạt động' : 'Inactive'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. BẢNG DỮ LIỆU */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
            <span>{t('admin.common.loading')}</span>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="font-bold text-blue-950">{t('admin.users.emptyTitle')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('admin.users.emptyDesc')}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-blue-950">
                <tr>
                  <th className="px-3.5 py-3">{isVi ? 'Thành viên' : 'User'}</th>
                  <th className="px-3.5 py-3">{isVi ? 'Email / SĐT' : 'Contact'}</th>
                  <th className="px-3 py-3 text-center">{isVi ? 'Vai trò' : 'Role'}</th>
                  <th className="px-3 py-3 text-center">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="px-3 py-3 hidden md:table-cell">{isVi ? 'Ngày tạo' : 'Created'}</th>
                  <th className="px-3.5 py-3 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrentAdmin =
                    currentUser?.userId && String(currentUser.userId) === String(u.id)
                  const isAdminRole = u.role === 'ADMIN'

                  return (
                    <tr
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className="cursor-pointer transition hover:bg-slate-50/80"
                    >
                      {/* Cột Người dùng: Avatar + Tên */}
                      <td className="px-3 py-2.5 sm:px-3.5 sm:py-3">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            name={u.fullName || u.email}
                            src={u.avatarUrl}
                            size="sm"
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
                              {u.fullName || '—'}
                            </p>
                            <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate">
                              ID: {u.id?.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột Liên hệ: Email & Phone */}
                      <td className="px-3 py-2.5 sm:px-3.5 sm:py-3">
                        <p className="font-medium text-slate-800 text-xs truncate max-w-[190px]" title={u.email}>
                          {u.email}
                        </p>
                        {u.phone && (
                          <p className="text-[11px] text-slate-500 font-mono">{u.phone}</p>
                        )}
                      </td>

                      {/* Cột Vai trò */}
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            u.role === 'ADMIN'
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                              : u.role === 'BUDDY'
                                ? 'border-amber-200 bg-amber-50 text-amber-700'
                                : 'border-slate-200 bg-slate-50 text-slate-600'
                          }`}
                        >
                          {getRoleLabel(u.role)}
                        </span>
                      </td>

                      {/* Cột Trạng thái */}
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className={`inline-block rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            u.status === 'ACTIVE'
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-slate-100 text-slate-600'
                          }`}
                        >
                          {getStatusLabel(u.status)}
                        </span>
                      </td>

                      {/* Cột Ngày tạo (Dạng ngắn DD/MM/YYYY) */}
                      <td className="px-3 py-2.5 text-xs text-slate-500 hidden md:table-cell whitespace-nowrap">
                        {formatDDMMYYYY(u.createdAt) || '—'}
                      </td>

                      {/* Cột Thao tác */}
                      <td
                        className="px-3 py-2.5 sm:px-3.5 sm:py-3 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {u.role === 'USER' && (
                            <button
                              type="button"
                              onClick={() => setUpgradingUser(u)}
                              className="rounded-lg bg-yellow-400 border border-yellow-500/40 px-2 py-1 text-xs font-bold text-blue-950 transition hover:bg-yellow-300 shadow-2xs shrink-0"
                              title={isVi ? 'Nâng cấp nhân viên này thành Buddy' : 'Upgrade this user to Buddy'}
                            >
                              {isVi ? 'Lên Buddy' : 'To Buddy'}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setSelectedUserId(u.id)}
                            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-100 shrink-0"
                          >
                            {isVi ? 'Xem' : 'View'}
                          </button>

                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => handleToggleClick(u)}
                            className={`rounded-lg border px-2 py-1 text-xs font-bold transition shrink-0 disabled:opacity-50 ${
                              u.status === 'ACTIVE'
                                ? isCurrentAdmin || isAdminRole
                                  ? 'border-slate-200 bg-slate-100 text-slate-400 hover:border-slate-300'
                                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                            title={
                              isCurrentAdmin
                                ? isVi
                                  ? 'Không thể ngưng hoạt động tài khoản của chính mình'
                                  : 'Cannot deactivate your own account'
                                : isAdminRole
                                  ? isVi
                                    ? 'Không thể ngưng hoạt động tài khoản có vai trò Quản trị viên'
                                    : 'Cannot deactivate Administrator accounts'
                                  : undefined
                            }
                          >
                            {u.status === 'ACTIVE'
                              ? isVi ? 'Khóa' : 'Deactivate'
                              : isVi ? 'Kích hoạt' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Thanh phân trang Server-side */}
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

      {/* Modal Chi tiết người dùng */}
      {selectedUserId && (
        <AdminUserDetailModal
          isOpen={true}
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}

      {/* Modal cảnh báo khi cố tình ngưng hoạt động tài khoản ADMIN hoặc chính mình */}
      {warningModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-8 ring-amber-50/50">
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black tracking-tight text-blue-950">
                  {isVi ? 'Không thể thực hiện' : 'Action Prohibited'}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {warningModal.isSelf
                    ? isVi
                      ? 'Bạn không thể tự ngưng hoạt động tài khoản của chính mình vì bạn đang đăng nhập với tài khoản này.'
                      : 'You cannot deactivate your own account while logged in.'
                    : isVi
                      ? 'Hệ thống không cho phép ngưng hoạt động tài khoản có vai trò Quản trị viên để đảm bảo an toàn truy cập.'
                      : 'The system prohibits deactivating Administrator accounts for security reasons.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() =>
                  setWarningModal({ isOpen: false, user: null, isSelf: false })
                }
                className="rounded-xl bg-blue-950 px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-900 active:scale-95"
              >
                {isVi ? 'Đã hiểu' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận cảnh báo khi ngưng hoạt động tài khoản BUDDY */}
      <AdminConfirmModal
        isOpen={confirmModal.isOpen}
        isDestructive={true}
        title={isVi ? 'Xác nhận ngưng hoạt động tài khoản Buddy' : 'Confirm Buddy Account Deactivation'}
        message={
          isVi
            ? `Tài khoản "${confirmModal.user?.fullName || confirmModal.user?.email || ''}" có vai trò là Buddy (Hướng dẫn viên). Việc ngưng hoạt động tài khoản người dùng sẽ đồng thời chuyển hồ sơ Buddy sang "Ngưng hoạt động" và gỡ Buddy khỏi các tour sắp tới. Bạn có chắc chắn muốn thực hiện?`
            : `User "${confirmModal.user?.fullName || confirmModal.user?.email || ''}" has the BUDDY role. Deactivating this account will also set their Buddy profile to Inactive and unassign upcoming tours. Are you sure you want to proceed?`
        }
        confirmText={isVi ? 'Ngưng hoạt động' : 'Deactivate'}
        cancelText={isVi ? 'Hủy bỏ' : 'Cancel'}
        loading={actionLoading}
        onConfirm={() => {
          if (confirmModal.user) {
            onToggleStatus?.(
              confirmModal.user.id,
              confirmModal.user.status,
              confirmModal.user.role,
              confirmModal.user.fullName
            )
            setConfirmModal({ isOpen: false, user: null })
          }
        }}
        onClose={() => setConfirmModal({ isOpen: false, user: null })}
      />

      {/* Modal Nâng cấp nhân viên USER thành BUDDY */}
      <AdminUpgradeBuddyModal
        isOpen={Boolean(upgradingUser)}
        user={upgradingUser}
        onClose={() => setUpgradingUser(null)}
        onSuccess={(data, targetUser) => {
          const userObj = targetUser || upgradingUser
          const upgradedName = userObj?.fullName || userObj?.email || ''
          const upgradedId = userObj?.id

          // Cập nhật ngay vai trò trên giao diện không cần chờ F5
          if (upgradedId) {
            setLocalRoleOverrides((prev) => ({ ...prev, [upgradedId]: 'BUDDY' }))
          }
          setUpgradingUser(null)

          // Thông báo thành công
          showToast?.({
            type: 'success',
            title: isVi ? 'Nâng cấp Buddy thành công' : 'Buddy Upgraded Successfully',
            message: isVi
              ? `Tài khoản ${upgradedName ? `"${upgradedName}"` : ''} đã trở thành Hướng dẫn viên (Buddy)!`
              : `User ${upgradedName ? `"${upgradedName}"` : ''} is now a Buddy!`,
            duration: 4500,
          })

          // Đồng bộ tải lại danh sách từ server
          if (onRefresh) {
            onRefresh()
          } else {
            onFiltersChange?.({ ...filters })
          }
        }}
        onError={(err, msg) => {
          showToast?.({
            type: 'error',
            title: isVi ? 'Nâng cấp Buddy thất bại' : 'Failed to Upgrade Buddy',
            message: msg || (isVi ? 'Không thể nâng cấp tài khoản thành Buddy.' : 'Could not upgrade account to Buddy.'),
            duration: 5000,
          })
        }}
      />
    </div>
  )
}