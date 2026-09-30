import { useEffect } from 'react'
import { useLanguage } from '@/context/languageContext.js'

export function AdminConfirmModal({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  isDestructive = true,
  loading = false,
  onConfirm,
  onClose,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const titleFinal = title || (isVi ? 'Xác nhận thao tác' : 'Confirm Action')
  const messageFinal = message || (isVi ? 'Bạn có chắc chắn muốn thực hiện hành động này không?' : 'Are you sure you want to proceed with this action?')
  const confirmTextFinal = confirmText || (isVi ? 'Xác nhận' : 'Confirm')
  const cancelTextFinal = cancelText || (isVi ? 'Hủy bỏ' : 'Cancel')
  // Lắng nghe phím ESC để đóng modal
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
              isDestructive
                ? 'bg-rose-50 text-rose-600 ring-8 ring-rose-50/50'
                : 'bg-blue-50 text-blue-950 ring-8 ring-blue-50/50'
            }`}
          >
            {isDestructive ? (
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
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            ) : (
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
                  d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h3 className="text-base font-black tracking-tight text-blue-950">
              {titleFinal}
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
              {messageFinal}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            {cancelTextFinal}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-xs font-bold text-white shadow-sm transition disabled:opacity-50 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-blue-950 hover:bg-blue-900'
            }`}
          >
            {loading && (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>{loading ? (isVi ? 'Đang xử lý...' : 'Processing...') : confirmTextFinal}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
