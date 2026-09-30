import { useEffect } from 'react'
import { useLanguage } from '@/context/languageContext.js'

/**
 * Toast notification popup for Admin operations (Add/Edit/Delete/Status change/Logout).
 *
 * Props:
 * - toast: { id, type: 'success' | 'error' | 'info', title, message, duration?: number }
 * - onClose: function()
 */
export function AdminToastNotification({ toast, onClose }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  useEffect(() => {
    if (!toast) return
    const duration = toast.duration ?? (toast.type === 'error' ? 5000 : 3500)
    const timer = setTimeout(() => {
      onClose?.()
    }, duration)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const isSuccess = toast.type === 'success'
  const isError = toast.type === 'error'
  const isWarning = toast.type === 'warning'

  const defaultTitle = isSuccess
    ? (isVi ? 'Thành công' : 'Success')
    : isError
      ? (isVi ? 'Thao tác thất bại' : 'Action Failed')
      : isWarning
        ? (isVi ? 'Cảnh báo' : 'Warning')
        : (isVi ? 'Thông báo' : 'Notification')

  return (
    <div
      role="alert"
      className="fixed right-6 top-6 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4"
      style={{
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Icon badge */}
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-4 ${
          isSuccess
            ? 'bg-emerald-500 text-white ring-emerald-50'
            : isError
              ? 'bg-rose-500 text-white ring-rose-50'
              : isWarning
                ? 'bg-amber-500 text-white ring-amber-100'
                : 'bg-blue-600 text-white ring-blue-50'
        }`}
      >
        {isSuccess ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : isError ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : isWarning ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-0.5">
        <h4 className="text-xs font-black tracking-tight text-blue-950">
          {toast.title || defaultTitle}
        </h4>
        {toast.message && (
          <p className="mt-1 text-xs leading-relaxed text-slate-600">
            {toast.message}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        title={isVi ? 'Đóng thông báo' : 'Close notification'}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
