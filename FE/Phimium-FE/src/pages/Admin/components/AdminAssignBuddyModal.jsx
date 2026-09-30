import { useEffect, useState } from 'react'

import { UserAvatar } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

/**
 * Modal chọn Buddy để gán thủ công cho đơn WAITING_FOR_BUDDY.
 * Props:
 *   isOpen: boolean
 *   candidates: BuddyResponse[] — danh sách buddy khả dụng
 *   loading: boolean — đang load candidates
 *   actionLoading: boolean — đang gán
 *   onAssign(buddyId): void
 *   onClose(): void
 */
export function AdminAssignBuddyModal({
  isOpen,
  candidates = [],
  loading = false,
  actionLoading = false,
  onAssign,
  onClose,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (isOpen) setSelected(null)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape' && !actionLoading) onClose?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, actionLoading, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={!actionLoading ? onClose : undefined} />

      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-yellow-400 shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black text-blue-950">
                {isVi ? 'Gán Buddy thủ công' : 'Manually Assign Buddy'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {isVi ? 'Chọn Buddy phù hợp cho đơn đặt chỗ này' : 'Select a suitable Buddy for this booking'}
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={actionLoading}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {loading ? (
            <div className="flex h-32 items-center justify-center gap-2 text-xs text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
              <span>{isVi ? 'Đang tải danh sách Buddy...' : 'Loading Buddy list...'}</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
              <p className="text-sm font-bold text-blue-950">
                {isVi ? 'Không có Buddy khả dụng' : 'No available Buddies'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {isVi ? 'Hiện tại không có Buddy nào phù hợp với ca này.' : 'Currently there are no Buddies available for this time slot.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {candidates.map((buddy) => {
                const id = buddy.buddyId ?? buddy.id
                const isSelected = selected === id
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelected(id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-blue-950 bg-blue-950/5 ring-1 ring-blue-950'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <UserAvatar name={buddy.fullName} imageUrl={buddy.avatarUrl} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-blue-950">{buddy.fullName}</p>
                      {buddy.introduction && (
                        <p className="line-clamp-1 text-xs text-slate-400">{buddy.introduction}</p>
                      )}
                      {buddy.averageRating > 0 && (
                        <p className="text-xs text-yellow-600">
                          ★ {buddy.averageRating.toFixed(1)} ({buddy.totalReviews} {isVi ? 'đánh giá' : 'reviews'})
                        </p>
                      )}
                    </div>
                    <div className={`h-4 w-4 shrink-0 rounded-full border-2 ${
                      isSelected ? 'border-blue-950 bg-blue-950' : 'border-slate-300'
                    }`}>
                      {isSelected && (
                        <svg viewBox="0 0 16 16" fill="white" className="h-full w-full p-0.5">
                          <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z" />
                        </svg>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            disabled={actionLoading}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={actionLoading || !selected}
            onClick={() => selected && onAssign?.(selected)}
            className="flex items-center gap-1.5 rounded-xl bg-blue-950 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-900 transition disabled:opacity-50"
          >
            {actionLoading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>
              {actionLoading
                ? (isVi ? 'Đang gán...' : 'Assigning...')
                : (isVi ? 'Xác nhận gán Buddy' : 'Confirm Buddy Assignment')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
