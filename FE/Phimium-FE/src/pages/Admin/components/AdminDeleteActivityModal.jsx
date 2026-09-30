import { useState, useEffect } from 'react'
import { getErrorMessage } from '@/utils/response.js'
import { formatMoney } from '@/utils/format.js'
import { useLanguage } from '@/context/languageContext.js'

export function AdminDeleteActivityModal({
  isOpen,
  activity,
  onClose,
  onDelete,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('')
      setLoading(false)
    }
  }, [isOpen, activity])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen || !activity) return null

  const hasDepartures = Array.isArray(activity.departures) && activity.departures.length > 0

  const handleConfirmDelete = async () => {
    try {
      setLoading(true)
      setErrorMsg('')
      await onDelete(activity.id)
      onClose()
    } catch (err) {
      console.error('Lỗi khi xóa tour:', err)
      setErrorMsg(getErrorMessage(err, isVi ? 'Không thể xóa tour. Vui lòng kiểm tra lại.' : 'Failed to delete tour. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={!loading ? onClose : undefined} />

      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-rose-50/50 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black text-rose-900">
                {isVi ? 'Xác nhận xóa tour' : 'Confirm Delete Tour'}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                {isVi ? 'Thao tác này sẽ xóa dữ liệu tour khỏi hệ thống' : 'This action will permanently delete the tour data'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          {/* Activity summary card */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
            {activity.thumbnailUrl ? (
              <img
                src={activity.thumbnailUrl}
                alt={activity.title}
                className="h-12 w-12 shrink-0 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-950/10 text-base font-bold text-blue-950">
                {activity.title?.charAt(0) || 'P'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-xs font-black text-blue-950">{activity.title}</p>
              <p className="line-clamp-1 text-[11px] text-slate-400">{activity.locationName || activity.address}</p>
              <p className="text-[11px] font-bold text-blue-950">
                {activity.price > 0 ? formatMoney(activity.price) : (isVi ? 'Miễn phí' : 'Free')}
              </p>
            </div>
          </div>

          {/* Warning regarding departures */}
          {hasDepartures ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900">
              <div className="flex items-start gap-2">
                <svg className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="space-y-1">
                  <p className="font-bold">
                    {isVi ? `Tour này hiện có ${activity.departures.length} ca khởi hành!` : `This tour currently has ${activity.departures.length} departures!`}
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {isVi
                      ? 'Theo quy định nghiệp vụ của hệ thống, tour đã được xếp ca khởi hành hoặc đã có khách đặt chỗ không thể bị xóa để đảm bảo toàn vẹn dữ liệu.'
                      : 'According to system policy, tours with scheduled departures or customer bookings cannot be deleted to ensure data integrity.'}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-600 leading-relaxed">
              {isVi
                ? 'Bạn có chắc chắn muốn xóa tour này không? Tour chưa có ca khởi hành nào nên có thể được xóa an toàn khỏi hệ thống.'
                : 'Are you sure you want to delete this tour? It has no departures and can be safely deleted from the system.'}
            </p>
          )}

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="button"
              disabled={loading || hasDepartures}
              onClick={handleConfirmDelete}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-rose-600/20 transition hover:bg-rose-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>
                {loading
                  ? (isVi ? 'Đang xóa...' : 'Deleting...')
                  : (isVi ? 'Xác nhận xóa' : 'Confirm Delete')}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
