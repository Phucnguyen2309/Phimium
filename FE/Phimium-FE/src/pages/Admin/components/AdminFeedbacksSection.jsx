import { useEffect, useMemo, useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'
import { formatDateTime, matchSearchText } from '@/utils/format.js'
import { AdminConfirmModal } from './AdminConfirmModal.jsx'
import { AdminPagination } from './AdminPagination.jsx'

// Component render sao đánh giá trực quan hỗ trợ cả sao lẻ (vd: 4.3, 4.5, 5.0)
function StarRating({ rating = 0, size = 'sm' }) {
  const numRating = Number(rating) || 0
  const starSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <div className="inline-flex items-center gap-1.5" title={`${numRating.toFixed(1)}/5`}>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((index) => {
          const fillPercent = Math.max(0, Math.min(100, (numRating - (index - 1)) * 100))
          return (
            <div key={index} className={`relative ${starSize} inline-block`}>
              <svg
                className={`${starSize} text-slate-200 fill-current`}
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {fillPercent > 0 && (
                <div
                  className="absolute left-0 top-0 overflow-hidden"
                  style={{ width: `${fillPercent}%` }}
                >
                  <svg
                    className={`${starSize} text-amber-400 fill-current`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <span className="text-xs font-bold text-amber-600">
        {numRating > 0 ? numRating.toFixed(1) : '—'}
      </span>
    </div>
  )
}

// Modal Xem Chi Tiết Feedback (Lấy toàn bộ nhận xét chuyến đi & nhận xét Buddy bỏ vào đây)
function FeedbackDetailModal({ isOpen, feedback, onClose, onDelete, isVi }) {
  if (!isOpen || !feedback) return null

  const customerName = feedback.reviewerName || feedback.customerName || (isVi ? 'Khách hàng' : 'Customer')
  const tourName = feedback.activityTitle || feedback.tourTitle || '—'
  const tourRating = feedback.tripRating ?? feedback.rating ?? 0
  const tourComment = feedback.tripComment || feedback.tourComment || feedback.content || feedback.comment || ''
  const buddyRating = feedback.buddyRating ?? 0
  const buddyComment = feedback.buddyComment || ''

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              ★
            </span>
            <h3 className="font-bold text-blue-950">
              {isVi ? 'Chi tiết Đánh giá & Nhận xét' : 'Review & Feedback Details'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Nội dung chi tiết */}
        <div className="space-y-4 px-6 py-5 max-h-[75vh] overflow-y-auto">
          {/* Thông tin chung */}
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="block text-slate-400 font-medium">{isVi ? 'Khách hàng' : 'Customer'}:</span>
                <span className="font-bold text-slate-900">{customerName}</span>
              </div>
              <div>
                <span className="block text-slate-400 font-medium">{isVi ? 'Thời gian gửi' : 'Submitted at'}:</span>
                <span className="font-medium text-slate-700">{formatDateTime(feedback.createdAt)}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200/60">
                <span className="block text-slate-400 font-medium">{isVi ? 'Tour tham gia' : 'Booked Tour'}:</span>
                <span className="font-semibold text-blue-950">{tourName}</span>
                {feedback.buddyName && (
                  <p className="mt-1 text-slate-500">
                    {isVi ? 'Hướng dẫn viên (Buddy):' : 'Buddy:'}{' '}
                    <span className="font-semibold text-indigo-700">{feedback.buddyName}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 1. Nhận xét về Chuyến đi (Tour) */}
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {isVi ? '1. Đánh giá Chuyến đi (Tour)' : '1. Tour Experience'}
              </span>
              <StarRating rating={tourRating} size="md" />
            </div>
            <div className="rounded-lg bg-white p-3 border border-amber-100 text-xs text-slate-700 leading-relaxed min-h-[60px]">
              {tourComment ? (
                <p className="font-medium text-slate-800">"{tourComment}"</p>
              ) : (
                <p className="text-slate-400 italic">
                  {isVi ? 'Khách hàng không để lại nhận xét bằng lời cho tour.' : 'No written comment for this tour.'}
                </p>
              )}
            </div>
          </div>

          {/* 2. Nhận xét về Hướng dẫn viên (Buddy) */}
          <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                {isVi ? '2. Đánh giá Hướng dẫn viên (Buddy)' : '2. Buddy Performance'}
              </span>
              {buddyRating > 0 ? (
                <StarRating rating={buddyRating} size="md" />
              ) : (
                <span className="text-xs text-slate-400 italic">{isVi ? 'Không chấm sao' : 'No rating'}</span>
              )}
            </div>
            <div className="rounded-lg bg-white p-3 border border-indigo-100 text-xs text-slate-700 leading-relaxed min-h-[60px]">
              {buddyComment ? (
                <p className="font-medium text-slate-800">"{buddyComment}"</p>
              ) : (
                <p className="text-slate-400 italic">
                  {isVi ? 'Khách hàng không để lại nhận xét bằng lời cho Buddy.' : 'No written comment for Buddy.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
          <button
            type="button"
            onClick={() => onDelete?.(feedback.id)}
            className="rounded-xl border border-rose-200 bg-white px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50"
          >
            {isVi ? 'Xóa đánh giá này' : 'Delete Review'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-blue-950 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-blue-900"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminFeedbacksSection({
  feedbacks = [],
  loading = false,
  actionLoading = false,
  filters = { page: 0, size: 10, keyword: '', tourRating: '', buddyRating: '' },
  pagination = { page: 0, size: 10, totalPages: 1, totalElements: 0 },
  onPageChange,
  onSizeChange,
  onFiltersChange,
  onDeleteFeedback,
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'
  const [searchTerm, setSearchTerm] = useState(filters?.keyword || '')
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [deletingFeedbackId, setDeletingFeedbackId] = useState(null)

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

  // Lọc tức thì (instant) ở client theo tên khách hàng, tour, buddy, nhận xét (hỗ trợ có dấu và không dấu)
  const filteredFeedbacks = useMemo(() => {
    if (!searchTerm.trim()) return feedbacks
    const term = searchTerm.trim()
    return feedbacks.filter((f) => {
      const customerName = f.reviewerName || f.customerName || ''
      const tourName = f.activityTitle || f.tourTitle || ''
      const buddyName = f.buddyName || ''
      const tourComment = f.tripComment || f.tourComment || f.content || f.comment || ''
      const buddyComment = f.buddyComment || ''
      return (
        matchSearchText(customerName, term) ||
        matchSearchText(tourName, term) ||
        matchSearchText(buddyName, term) ||
        matchSearchText(tourComment, term) ||
        matchSearchText(buddyComment, term)
      )
    })
  }, [feedbacks, searchTerm])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    onFiltersChange?.({ keyword: searchTerm.trim() })
  }

  const handleConfirmDelete = async () => {
    if (deletingFeedbackId) {
      await onDeleteFeedback?.(deletingFeedbackId)
      setDeletingFeedbackId(null)
      if (selectedFeedback?.id === deletingFeedbackId) {
        setSelectedFeedback(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. THANH BỘ LỌC TÌM KIẾM & RATING (Server-side) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Tìm kiếm */}
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
            placeholder={isVi ? 'Tìm theo tên khách, tour, buddy, nội dung...' : 'Search by customer, tour, buddy, review content...'}
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

        {/* Lọc theo số sao tour */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{isVi ? 'Đánh giá tour:' : 'Tour Rating:'}</span>
          <select
            value={filters?.tourRating || ''}
            onChange={(e) => onFiltersChange?.({ tourRating: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
          >
            <option value="">{isVi ? 'Tất cả số sao' : 'All Ratings'}</option>
            <option value="5">⭐⭐⭐⭐⭐ {isVi ? '5 sao' : '5 stars'}</option>
            <option value="4">⭐⭐⭐⭐ {isVi ? '4 sao' : '4 stars'}</option>
            <option value="3">⭐⭐⭐ {isVi ? '3 sao' : '3 stars'}</option>
            <option value="2">⭐⭐ {isVi ? '2 sao' : '2 stars'}</option>
            <option value="1">⭐ {isVi ? '1 sao' : '1 star'}</option>
          </select>
        </div>
      </div>

      {/* 2. BẢNG DỮ LIỆU ĐÁNH GIÁ (Vừa vặn 100% màn hình, không bao giờ bị cuộn ngang) */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
            <span>{t('admin.common.loading')}</span>
          </div>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="font-bold text-blue-950">{isVi ? 'Chưa có đánh giá nào' : 'No feedback yet'}</p>
          <p className="mt-1 text-xs text-slate-500">
            {isVi ? 'Không tìm thấy đánh giá phù hợp với bộ lọc hiện tại.' : 'No reviews match the current filter.'}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-blue-950">
              <tr>
                <th className="px-4 py-3.5 w-[22%]">{isVi ? 'Khách hàng' : 'Customer'}</th>
                <th className="px-4 py-3.5 w-[30%]">{isVi ? 'Tour & Hướng dẫn viên' : 'Tour & Buddy'}</th>
                <th className="px-4 py-3.5 w-[20%]">{isVi ? 'Điểm đánh giá' : 'Rating'}</th>
                <th className="px-4 py-3.5 w-[14%] whitespace-nowrap">{isVi ? 'Thời gian' : 'Time'}</th>
                <th className="px-4 py-3.5 w-[14%] text-right whitespace-nowrap">{isVi ? 'Thao tác' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {filteredFeedbacks.map((f) => {
                const customerName = f.reviewerName || f.customerName || (isVi ? 'Khách hàng' : 'Customer')
                const customerInitial = customerName.charAt(0).toUpperCase()
                const tourName = f.activityTitle || f.tourTitle || '—'
                const tourRating = Number(f.tripRating ?? f.rating ?? 0)
                const buddyRating = Number(f.buddyRating ?? 0)

                return (
                  <tr
                    key={f.id}
                    onClick={() => setSelectedFeedback(f)}
                    className="group cursor-pointer transition hover:bg-slate-50/70"
                  >
                    {/* Khách hàng */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-900 shadow-2xs">
                          {customerInitial}
                        </div>
                        <span className="font-semibold text-slate-900 group-hover:text-blue-950 transition truncate">
                          {customerName}
                        </span>
                      </div>
                    </td>

                    {/* Tour & Buddy */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="min-w-0">
                        <p className="font-semibold text-blue-950 truncate group-hover:text-blue-600 transition" title={tourName}>
                          {tourName}
                        </p>
                        {f.buddyName ? (
                          <p className="mt-0.5 text-xs text-slate-500 truncate">
                            <span className="text-slate-400">Buddy: </span>
                            <span className="font-medium text-indigo-700">{f.buddyName}</span>
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic">{isVi ? 'Không có Buddy' : 'No Buddy'}</p>
                        )}
                      </div>
                    </td>

                    {/* Điểm đánh giá (Badge nhỏ gọn, hiển thị đẹp) */}
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200/60">
                          <span className="text-amber-500">★</span>
                          <span>{tourRating > 0 ? tourRating.toFixed(1) : '—'}</span>
                          <span className="text-[10px] font-normal text-amber-600/80">Tour</span>
                        </span>

                        {buddyRating > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 border border-indigo-200/60">
                            <span className="text-indigo-500">★</span>
                            <span>{buddyRating.toFixed(1)}</span>
                            <span className="text-[10px] font-normal text-indigo-600/80">Buddy</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Thời gian */}
                    <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap align-middle">
                      {formatDateTime(f.createdAt)}
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3.5 text-right align-middle whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedFeedback(f)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-blue-950 shadow-2xs"
                        >
                          <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{isVi ? 'Xem' : 'View'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingFeedbackId(f.id)}
                          className="rounded-lg border border-rose-200 bg-white px-2 py-1 text-xs font-bold text-rose-600 transition hover:bg-rose-50 shadow-2xs"
                        >
                          {isVi ? 'Xóa' : 'Delete'}
                        </button>
                      </div>
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

      {/* Modal Xem chi tiết Feedback */}
      <FeedbackDetailModal
        isOpen={Boolean(selectedFeedback)}
        feedback={selectedFeedback}
        isVi={isVi}
        onClose={() => setSelectedFeedback(null)}
        onDelete={(id) => {
          setSelectedFeedback(null)
          setDeletingFeedbackId(id)
        }}
      />

      {/* Modal xác nhận xóa feedback */}
      <AdminConfirmModal
        isOpen={Boolean(deletingFeedbackId)}
        title={isVi ? 'Xóa đánh giá vi phạm' : 'Delete Review'}
        message={
          isVi
            ? 'Bạn có chắc chắn muốn xóa đánh giá này không? Thao tác này không thể hoàn tác.'
            : 'Are you sure you want to delete this review? This action cannot be undone.'
        }
        confirmText={isVi ? 'Xác nhận xóa' : 'Confirm Delete'}
        cancelText={isVi ? 'Hủy bỏ' : 'Cancel'}
        isDestructive={true}
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingFeedbackId(null)}
      />
    </div>
  )
}