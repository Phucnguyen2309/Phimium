import { useEffect, useState } from 'react'
import adminService from '@/services/adminService.js'
import { formatMoney, formatDateTime } from '@/utils/format.js'
import { useLanguage } from '@/context/languageContext.js'

export function AdminPaymentDetailModal({
  isOpen = true,
  paymentId,
  onClose,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !paymentId) {
      setData(null)
      setError('')
      return
    }

    let isMounted = true
    const fetchDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await adminService.getPaymentById(paymentId)
        if (isMounted) {
          const detail = res?.data?.data ?? res?.data ?? res
          setData(detail)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Lỗi tải chi tiết giao dịch:', err)
          setError(isVi ? 'Không thể tải chi tiết giao dịch.' : 'Failed to load transaction details.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDetail()
    return () => {
      isMounted = false
    }
  }, [isOpen, paymentId, isVi])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const isSuccess = data?.status === 'PAID' || data?.status === 'SUCCESS'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-yellow-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black text-blue-950">
                {isVi ? 'Chi tiết giao dịch thanh toán' : 'Payment Transaction Details'}
              </h3>
              <p className="font-mono text-[11px] font-bold text-slate-400">
                {data?.invoiceNumber ? `#${data.invoiceNumber}` : `ID: ${String(paymentId).slice(0, 8)}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-xs text-slate-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent mr-2" />
              {isVi ? 'Đang tải thông tin giao dịch...' : 'Loading transaction details...'}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-xs text-rose-600">
              {error}
            </div>
          ) : data ? (
            <div className="space-y-3.5 text-xs">
              <div className="text-center pb-2 border-b border-slate-100">
                <span className="text-[11px] font-medium text-slate-400">
                  {isVi ? 'Số tiền thanh toán' : 'Payment Amount'}
                </span>
                <p className="text-2xl font-black text-blue-950 mt-0.5">
                  {formatMoney(data.amount)}
                </p>
                <span className={`inline-block mt-2 rounded-full border px-2.5 py-0.5 font-bold ${
                  isSuccess
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : data.status === 'FAILED'
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-amber-200 bg-amber-50 text-amber-800'
                }`}>
                  {isSuccess
                    ? (isVi ? 'Thành công' : 'Paid')
                    : data.status}
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">{isVi ? 'Cổng thanh toán:' : 'Payment Gateway:'}</span>
                  <span className="font-bold text-slate-800">{data.provider || data.paymentMethod || 'SePay'}</span>
                </div>
                {data.providerTransactionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isVi ? 'Mã giao dịch đối tác:' : 'Partner Ref Code:'}</span>
                    <span className="font-mono font-bold text-blue-950">{data.providerTransactionId}</span>
                  </div>
                )}
                {data.registrationId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{isVi ? 'Mã đơn đặt chỗ:' : 'Booking ID:'}</span>
                    <span className="font-mono text-slate-700">{data.registrationId}</span>
                  </div>
                )}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{isVi ? 'Thời gian tạo:' : 'Created Time:'}</span>
                    <span className="font-semibold text-slate-800">{formatDateTime(data.createdAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{isVi ? 'Thời gian thanh toán:' : 'Payment Time:'}</span>
                    <span className={`font-bold ${data.paidAt ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {data.paidAt ? formatDateTime(data.paidAt) : (isVi ? 'Chưa hoàn tất' : 'Pending completion')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              {isVi ? 'Đóng' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
