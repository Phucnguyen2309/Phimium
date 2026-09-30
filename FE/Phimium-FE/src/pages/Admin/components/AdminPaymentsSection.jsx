import { useEffect, useMemo, useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'
import { formatDateTime, formatMoney, matchSearchText } from '@/utils/format.js'
import { AdminPagination } from './AdminPagination.jsx'
import { AdminPaymentDetailModal } from './AdminPaymentDetailModal.jsx'

// PaymentStatus Map chuẩn Backend: PENDING, PAID, FAILED, EXPIRED, REVIEW_REQUIRED
const PAYMENT_STATUS_MAP = {
  PAID: {
    label: 'Đã thanh toán',
    badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  PENDING: {
    label: 'Chờ thanh toán',
    badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  FAILED: {
    label: 'Thất bại',
    badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  EXPIRED: {
    label: 'Đã hết hạn',
    badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
  },
  REVIEW_REQUIRED: {
    label: 'Cần đối soát',
    badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
  },
}

export function AdminPaymentsSection({
  payments = [],
  loading = false,
  filters = { page: 0, size: 10, keyword: '', status: '' },
  pagination = { page: 0, size: 10, totalPages: 1, totalElements: 0 },
  onPageChange,
  onSizeChange,
  onFiltersChange,
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'
  const [searchTerm, setSearchTerm] = useState(filters?.keyword || '')
  const [selectedPaymentId, setSelectedPaymentId] = useState(null)

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

  // Lọc tức thì (instant) ở client hỗ trợ cả tiếng Việt có dấu và không dấu
  const filteredPayments = useMemo(() => {
    if (!searchTerm.trim()) return payments
    const term = searchTerm.trim()
    return payments.filter(
      (p) =>
        matchSearchText(p.userName, term) ||
        matchSearchText(p.invoiceNumber, term) ||
        matchSearchText(p.invoiceCode, term) ||
        matchSearchText(p.id, term)
    )
  }, [payments, searchTerm])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    onFiltersChange?.({ keyword: searchTerm.trim() })
  }

  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'PAID':
        return {
          label: isVi ? 'Đã thanh toán' : 'Paid',
          badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        }
      case 'PENDING':
        return {
          label: isVi ? 'Chờ thanh toán' : 'Pending',
          badgeClass: 'border-amber-200 bg-amber-50 text-amber-800',
        }
      case 'FAILED':
        return {
          label: isVi ? 'Thất bại' : 'Failed',
          badgeClass: 'border-rose-200 bg-rose-50 text-rose-700',
        }
      case 'EXPIRED':
        return {
          label: isVi ? 'Đã hết hạn' : 'Expired',
          badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
        }
      case 'REVIEW_REQUIRED':
        return {
          label: isVi ? 'Cần đối soát' : 'Review Required',
          badgeClass: 'border-orange-200 bg-orange-50 text-orange-700',
        }
      default:
        return {
          label: status || (isVi ? 'Chưa xác định' : 'Unknown'),
          badgeClass: 'border-slate-200 bg-slate-100 text-slate-600',
        }
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. THANH BỘ LỌC TÌM KIẾM & TRẠNG THÁI (Chuẩn Enum BE: PENDING, PAID, FAILED, EXPIRED, REVIEW_REQUIRED) */}
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
            placeholder={isVi ? 'Tìm theo mã hoá đơn, người thanh toán...' : 'Search by invoice code, payer...'}
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

        {/* Lọc trạng thái thanh toán chuẩn BE */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{isVi ? 'Trạng thái:' : 'Status:'}</span>
          <select
            value={filters?.status || ''}
            onChange={(e) => onFiltersChange?.({ status: e.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
          >
            <option value="">{isVi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
            <option value="PAID">{isVi ? 'Đã thanh toán (PAID)' : 'Paid (PAID)'}</option>
            <option value="PENDING">{isVi ? 'Chờ thanh toán (PENDING)' : 'Pending (PENDING)'}</option>
            <option value="FAILED">{isVi ? 'Thất bại (FAILED)' : 'Failed (FAILED)'}</option>
            <option value="EXPIRED">{isVi ? 'Đã hết hạn (EXPIRED)' : 'Expired (EXPIRED)'}</option>
            <option value="REVIEW_REQUIRED">{isVi ? 'Cần đối soát (REVIEW_REQUIRED)' : 'Review Required (REVIEW_REQUIRED)'}</option>
          </select>
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
      ) : filteredPayments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="font-bold text-blue-950">{t('admin.payments.emptyTitle')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('admin.payments.emptyDesc')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-blue-950">
                <tr>
                  <th className="px-5 py-3.5">{isVi ? 'Mã hóa đơn' : 'Invoice Number'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Người thanh toán' : 'Payer'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Số tiền' : 'Amount'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Phương thức' : 'Method'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="px-5 py-3.5 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const statusInfo = getPaymentStatusInfo(p.status)

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedPaymentId(p.id)}
                      className="cursor-pointer transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4 font-mono text-xs font-bold text-blue-950">
                        {p.invoiceNumber || p.invoiceCode || (p.id ? `INV-${String(p.id).slice(0, 8).toUpperCase()}` : '—')}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{p.userName || '—'}</td>
                      <td className="px-5 py-4 font-bold text-blue-950">{formatMoney(p.amount)}</td>
                      <td className="px-5 py-4 text-xs font-medium text-slate-600">
                        {p.paymentMethod || (isVi ? 'Chuyển khoản SePay' : 'SePay Bank Transfer')}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentId(p.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-blue-950 shadow-sm transition hover:bg-blue-50 hover:border-blue-200"
                        >
                          <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span>{isVi ? 'Xem' : 'View'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

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

      {selectedPaymentId && (
        <AdminPaymentDetailModal
          isOpen={true}
          paymentId={selectedPaymentId}
          onClose={() => setSelectedPaymentId(null)}
        />
      )}
    </div>
  )
}