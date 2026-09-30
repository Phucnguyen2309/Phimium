import { useMemo, useState } from 'react'

import { UserAvatar } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { matchSearchText } from '@/utils/format.js'
import { AdminPagination } from './AdminPagination.jsx'
import { AdminConfirmModal } from './AdminConfirmModal.jsx'

// BuddyStatus: ACTIVE | INACTIVE | SUSPENDED
const BUDDY_STATUS_MAP = {
  ACTIVE: {
    label: 'Đang hoạt động',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  INACTIVE: {
    label: 'Ngưng hoạt động',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
  },
  SUSPENDED: {
    label: 'Tạm khóa',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

function StarRating({ rating = 0 }) {
  const numericRating = Math.max(0, Math.min(5, Number(rating) || 0))
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const fillPercentage = Math.max(
          0,
          Math.min(100, (numericRating - (starIndex - 1)) * 100),
        )

        return (
          <span key={starIndex} className="relative inline-block h-3.5 w-3.5 flex-shrink-0">
            <svg
              className="h-3.5 w-3.5 text-slate-200"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
            </svg>

            {fillPercentage > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillPercentage}%` }}
              >
                <svg
                  className="h-3.5 w-3.5 max-w-none text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.062 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69L9.049 2.927z" />
                </svg>
              </span>
            )}
          </span>
        )
      })}
    </span>
  )
}

function BuddyIdTooltip({ id, isVi, isLast = false }) {
  const [copied, setCopied] = useState(false)
  if (!id) return <span className="text-xs text-slate-400 font-mono">—</span>

  const handleCopy = (e) => {
    e.stopPropagation()
    try {
      navigator.clipboard?.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="group relative inline-block">
      <span
        onClick={handleCopy}
        title={id}
        className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-slate-400 hover:text-blue-600 cursor-pointer transition select-all"
      >
        <span>ID: {id.slice(0, 8)}...</span>
        <svg className="h-3 w-3 opacity-60 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
        </svg>
      </span>

      {/* Floating Tooltip khi trỏ chuột vào: nếu ở hàng cuối thì nhảy lên trên để không kéo dòng */}
      <div
        className={`pointer-events-none absolute left-0 z-50 hidden w-max max-w-xs rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 text-[11px] font-mono text-white shadow-2xl backdrop-blur-md group-hover:block transition-all ${
          isLast ? 'bottom-full mb-2' : 'top-full mt-1.5'
        }`}
      >
        <div className="flex items-center gap-1.5 text-yellow-400 font-sans font-bold text-[10px] mb-0.5">
          <span>{copied ? '✓ ' + (isVi ? 'Đã sao chép ID!' : 'Copied!') : (isVi ? 'ID đầy đủ (Click để sao chép):' : 'Full ID (Click to copy):')}</span>
        </div>
        <p className="select-all text-slate-200">{id}</p>
        {isLast ? (
          <div className="absolute left-4 top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
        ) : (
          <div className="absolute left-4 bottom-full h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900" />
        )}
      </div>
    </div>
  )
}

function BuddyBioTooltip({ bio, isVi, isLast = false }) {
  const bioText = bio || ''
  if (!bioText) {
    return <span className="text-xs italic text-slate-400">{isVi ? 'Chưa cập nhật tiểu sử' : 'No bio updated'}</span>
  }

  const isLong = bioText.length > 50

  return (
    <div className="group relative inline-block max-w-xs">
      <p
        title={bioText}
        className={`line-clamp-2 text-xs text-slate-600 transition ${
          isLong ? 'cursor-help group-hover:text-blue-950 font-medium' : ''
        }`}
      >
        {bioText}
      </p>

      {/* Floating Tooltip khi trỏ chuột vào: nếu ở hàng cuối thì nhảy lên trên để không kéo dòng */}
      {isLong && (
        <div
          className={`pointer-events-none absolute left-0 z-50 hidden w-80 rounded-2xl border border-slate-700 bg-slate-900/95 p-3.5 text-xs leading-relaxed text-slate-100 shadow-2xl backdrop-blur-md group-hover:block transition-all ${
            isLast ? 'bottom-full mb-2' : 'top-full mt-1.5'
          }`}
        >
          <div className="mb-1.5 flex items-center gap-1.5 text-yellow-400 font-bold text-[11px]">
            <span>📝</span>
            <span>{isVi ? 'Tiểu sử chi tiết:' : 'Full Biography:'}</span>
          </div>
          <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words text-slate-200 custom-scrollbar-dark pr-1">
            {bioText}
          </p>
          {isLast ? (
            <div className="absolute left-6 top-full h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
          ) : (
            <div className="absolute left-6 bottom-full h-0 w-0 border-x-4 border-x-transparent border-b-4 border-b-slate-900" />
          )}
        </div>
      )}
    </div>
  )
}

export function AdminBuddiesSection({
  buddies = [],
  loading = false,
  actionLoading = false,
  filters = { status: '', keyword: '' },
  onFiltersChange,
  onApprove,
  onReject,
  onUpdateStatus,
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'
  const [searchTerm, setSearchTerm] = useState(filters?.keyword || '')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [confirmStatus, setConfirmStatus] = useState(null)

  const handleStatusChange = (buddyId, newStatus, buddyName = '') => {
    if (newStatus === 'SUSPENDED' || newStatus === 'INACTIVE') {
      setConfirmStatus({ buddyId, newStatus, buddyName })
    } else {
      executeStatusChange(buddyId, newStatus)
    }
  }

  const executeStatusChange = (buddyId, newStatus) => {
    if (onUpdateStatus) {
      onUpdateStatus(buddyId, newStatus)
    } else if (newStatus === 'ACTIVE') {
      onApprove?.(buddyId)
    } else if (newStatus === 'SUSPENDED') {
      onReject?.(buddyId)
    }
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'ACTIVE':
        return {
          label: isVi ? 'Đang hoạt động' : 'Active',
          badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        }
      case 'INACTIVE':
        return {
          label: isVi ? 'Ngưng hoạt động' : 'Inactive',
          badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
        }
      case 'SUSPENDED':
        return {
          label: isVi ? 'Tạm khóa' : 'Suspended',
          badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
        }
      default:
        return {
          label: status || (isVi ? 'Chưa xác định' : 'Unknown'),
          badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
        }
    }
  }

  const filteredBuddies = useMemo(() => {
    return buddies.filter((b) => {
      if (filters?.status && b.status !== filters.status) return false
      if (!searchTerm.trim()) return true
      const term = searchTerm.trim()
      return (
        matchSearchText(b.fullName, term) ||
        matchSearchText(b.bio, term) ||
        matchSearchText(b.introduction, term)
      )
    })
  }, [buddies, filters?.status, searchTerm])

  const totalPages = Math.ceil(filteredBuddies.length / pageSize) || 1
  const paginatedBuddies = useMemo(() => {
    const start = page * pageSize
    return filteredBuddies.slice(start, start + pageSize)
  }, [filteredBuddies, page, pageSize])

  return (
    <div className="space-y-4">
      {/* 1. THANH BỘ LỌC TÌM KIẾM & TRẠNG THÁI */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Tìm kiếm */}
        <div className="relative max-w-sm flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setPage(0)
            }}
            placeholder={isVi ? 'Tìm theo tên hướng dẫn viên, giới thiệu...' : 'Search by buddy name, bio...'}
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
                setPage(0)
              }}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Lọc trạng thái Buddy */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{isVi ? 'Trạng thái:' : 'Status:'}</span>
          <select
            value={filters?.status || ''}
            onChange={(e) => {
              onFiltersChange?.({ status: e.target.value })
              setPage(0)
            }}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
          >
            <option value="">{isVi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
            <option value="ACTIVE">{isVi ? 'Đang hoạt động' : 'Active'}</option>
            <option value="INACTIVE">{isVi ? 'Ngưng hoạt động' : 'Inactive'}</option>
            <option value="SUSPENDED">{isVi ? 'Tạm khóa' : 'Suspended'}</option>
          </select>
        </div>
      </div>

      {/* 2. BẢNG DỮ LIỆU BUDDY */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
            <span>{t('admin.common.loading')}</span>
          </div>
        </div>
      ) : paginatedBuddies.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="font-bold text-blue-950">{t('admin.buddies.emptyTitle')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('admin.buddies.emptyDesc')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-blue-950">
                <tr>
                  <th className="px-5 py-3.5">{isVi ? 'Hướng dẫn viên' : 'Buddy'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Tiểu sử' : 'Bio'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Ngôn ngữ & Chuyên môn' : 'Languages & Skills'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Đánh giá' : 'Rating'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="px-5 py-3.5 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedBuddies.map((b, idx) => {
                  const statusInfo = getStatusInfo(b.status)
                  const isLast = idx >= Math.max(0, paginatedBuddies.length - 2)

                  return (
                    <tr key={b.id} className="transition hover:bg-slate-50/80">
                      {/* Buddy avatar + Tên */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar
                            name={b.fullName}
                            src={b.avatarUrl}
                            size="md"
                            className="shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">
                              {b.fullName}
                            </p>
                            <BuddyIdTooltip id={b.id} isVi={isVi} isLast={isLast} />
                          </div>
                        </div>
                      </td>

                      {/* Bio (Kỹ thuật con trỏ hover để đọc đầy đủ) */}
                      <td className="px-5 py-4 max-w-xs text-xs text-slate-600">
                        <BuddyBioTooltip bio={b.bio || b.introduction} isVi={isVi} isLast={isLast} />
                      </td>

                      {/* Ngôn ngữ & Chuyên môn */}
                      <td className="px-5 py-4 text-xs text-slate-700">
                        {Array.isArray(b.languages) && b.languages.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {b.languages.map((lang, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700"
                              >
                                {lang}
                              </span>
                            ))}
                          </div>
                        ) : (
                          isVi ? 'Tiếng Việt' : 'Vietnamese'
                        )}
                      </td>

                      {/* Đánh giá sao */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <StarRating rating={b.rating || b.averageRating || 5} />
                          <span className="text-xs font-bold text-slate-800">
                            {Number(b.rating || b.averageRating || 5).toFixed(1)}
                          </span>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Thao tác Trạng thái Buddy: ACTIVE, INACTIVE, SUSPENDED */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút 1: Kích hoạt (khi không phải ACTIVE) hoặc Ngưng hoạt động (khi đang ACTIVE) */}
                          {b.status === 'ACTIVE' ? (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleStatusChange(b.id, 'INACTIVE', b.fullName)}
                              title={
                                isVi
                                  ? 'Ngưng nhận tour tạm thời (khi Buddy bận, nghỉ phép)'
                                  : 'Pause taking tours (Buddy is busy or on leave)'
                              }
                              className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                            >
                              {isVi ? 'Ngưng hoạt động' : 'Inactive'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleStatusChange(b.id, 'ACTIVE', b.fullName)}
                              title={
                                isVi
                                  ? 'Kích hoạt sẵn sàng nhận tour'
                                  : 'Activate buddy to take tours'
                              }
                              className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                            >
                              {isVi ? 'Kích hoạt' : 'Activate'}
                            </button>
                          )}

                          {/* Nút 2: Tạm khóa / Đình chỉ (khi không phải SUSPENDED) hoặc Ngưng hoạt động (khi đang SUSPENDED) */}
                          {b.status === 'SUSPENDED' ? (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleStatusChange(b.id, 'INACTIVE', b.fullName)}
                              title={
                                isVi
                                  ? 'Chuyển sang trạng thái ngưng hoạt động'
                                  : 'Set status to inactive'
                              }
                              className="rounded-lg border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
                            >
                              {isVi ? 'Ngưng hoạt động' : 'Inactive'}
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleStatusChange(b.id, 'SUSPENDED', b.fullName)}
                              title={
                                isVi
                                  ? 'Tạm khóa / Đình chỉ hoạt động (tự động gỡ các tour chưa diễn ra)'
                                  : 'Suspend buddy (automatically unassign from upcoming tours)'
                              }
                              className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                            >
                              {isVi ? 'Tạm khóa' : 'Suspend'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={filteredBuddies.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setPage(0)
            }}
          />
        </div>
      )}

      {/* Modal Cảnh Báo & Xác Nhận Tạm Khóa / Ngưng Hoạt Động */}
      <AdminConfirmModal
        isOpen={Boolean(confirmStatus)}
        isDestructive={confirmStatus?.newStatus === 'SUSPENDED'}
        title={
          confirmStatus?.newStatus === 'SUSPENDED'
            ? (isVi ? 'Xác nhận tạm khóa Buddy' : 'Confirm Buddy Suspension')
            : (isVi ? 'Xác nhận ngưng hoạt động' : 'Confirm Deactivation')
        }
        message={
          confirmStatus?.newStatus === 'SUSPENDED'
            ? (isVi
                ? `Bạn có chắc chắn muốn tạm khóa hoạt động của Buddy ${confirmStatus?.buddyName ? `"${confirmStatus.buddyName}"` : ''}? Hệ thống sẽ tự động gỡ Buddy khỏi các tour sắp diễn ra và chuyển về trạng thái "Chờ xếp Buddy".`
                : `Are you sure you want to suspend Buddy ${confirmStatus?.buddyName ? `"${confirmStatus.buddyName}"` : ''}? All upcoming assigned tours will be automatically moved to "Waiting for Buddy".`)
            : (isVi
                ? `Bạn có chắc chắn muốn chuyển Buddy ${confirmStatus?.buddyName ? `"${confirmStatus.buddyName}"` : ''} sang trạng thái ngưng hoạt động?`
                : `Are you sure you want to set Buddy ${confirmStatus?.buddyName ? `"${confirmStatus.buddyName}"` : ''} to inactive?`)
        }
        confirmText={
          confirmStatus?.newStatus === 'SUSPENDED'
            ? (isVi ? 'Tạm khóa' : 'Suspend')
            : (isVi ? 'Ngưng hoạt động' : 'Deactivate')
        }
        cancelText={isVi ? 'Hủy bỏ' : 'Cancel'}
        loading={actionLoading}
        onConfirm={() => {
          if (confirmStatus) {
            executeStatusChange(confirmStatus.buddyId, confirmStatus.newStatus)
            setConfirmStatus(null)
          }
        }}
        onClose={() => setConfirmStatus(null)}
      />
    </div>
  )
}