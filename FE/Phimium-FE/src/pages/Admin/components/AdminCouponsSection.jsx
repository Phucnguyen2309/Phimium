import { useMemo, useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'
import { formatMoney } from '@/utils/format.js'
import { AdminPagination } from './AdminPagination.jsx'

export function AdminCouponsSection({
  coupons = [],
  loading = false,
  actionLoading = false,
  onOpenCreateModal,
  onEditCoupon,
  onDeleteCoupon,
}) {
  const { t, language } = useLanguage()
  const isVi = language === 'vi'
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)

  const formatDateShort = (str) => {
    if (!str) return '—'
    try {
      return new Date(str).toLocaleDateString(isVi ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })
    } catch {
      return str
    }
  }

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (selectedStatus && c.status !== selectedStatus) return false
      if (!searchTerm.trim()) return true
      const term = searchTerm.toLowerCase()
      return (
        c.code?.toLowerCase().includes(term) ||
        c.name?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      )
    })
  }, [coupons, selectedStatus, searchTerm])

  const totalPages = Math.ceil(filteredCoupons.length / pageSize) || 1
  const paginatedCoupons = useMemo(() => {
    const start = page * pageSize
    return filteredCoupons.slice(start, start + pageSize)
  }, [filteredCoupons, page, pageSize])

  return (
    <div className="space-y-4">
      {/* 1. THANH BỘ LỌC TÌM KIẾM, TRẠNG THÁI & NÚT TẠO */}
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
            placeholder={isVi ? 'Tìm theo mã coupon, tên ưu đãi...' : 'Search by coupon code, name...'}
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

        {/* Lọc trạng thái & Nút Thêm mới */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">{isVi ? 'Trạng thái:' : 'Status:'}</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value)
                setPage(0)
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-slate-300 focus:border-blue-950"
            >
              <option value="">{isVi ? 'Tất cả trạng thái' : 'All Statuses'}</option>
              <option value="ACTIVE">{isVi ? 'Đang áp dụng' : 'Active'}</option>
              <option value="INACTIVE">{isVi ? 'Ngưng áp dụng' : 'Inactive'}</option>
              <option value="EXPIRED">{isVi ? 'Đã hết hạn' : 'Expired'}</option>
            </select>
          </div>

          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-yellow-400 px-3.5 py-2 text-xs font-bold text-blue-950 shadow-sm transition hover:bg-yellow-300 active:scale-95"
          >
            <span className="text-base leading-none font-black">+</span>
            <span>{isVi ? 'Tạo mã mới' : 'Create Coupon'}</span>
          </button>
        </div>
      </div>

      {/* 2. BẢNG DỮ LIỆU COUPON */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
            <span>{t('admin.common.loading')}</span>
          </div>
        </div>
      ) : paginatedCoupons.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <p className="font-bold text-blue-950">{t('admin.coupons.emptyTitle')}</p>
          <p className="mt-1 text-xs text-slate-500">{t('admin.coupons.emptyDesc')}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold text-blue-950">
                <tr>
                  <th className="px-5 py-3.5">{isVi ? 'Mã / Tên' : 'Code / Name'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Giảm' : 'Discount'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'ĐH tối thiểu' : 'Min Order'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Đã dùng' : 'Usage'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Hiệu lực' : 'Validity'}</th>
                  <th className="px-5 py-3.5">{isVi ? 'Trạng thái' : 'Status'}</th>
                  <th className="px-5 py-3.5 text-right">{isVi ? 'Thao tác' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedCoupons.map((c) => (
                  <tr key={c.id} className="transition hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <span className="block rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-black text-blue-950 w-fit">
                        {c.code}
                      </span>
                      {c.name && (
                        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{c.name}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {c.discountType === 'PERCENTAGE'
                        ? `${c.discountValue}%`
                        : formatMoney(c.discountValue)}
                      {c.maximumDiscountAmount > 0 && (
                        <p className="text-xs font-normal text-slate-400">
                          {isVi ? 'tối đa' : 'max'} {formatMoney(c.maximumDiscountAmount)}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-600">
                      {c.minimumOrderAmount > 0 ? formatMoney(c.minimumOrderAmount) : '—'}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-700">
                      {c.usedCount} / {c.usageLimit > 0 ? c.usageLimit : '∞'}
                    </td>
                    <td className="px-5 py-4 text-xs font-medium text-slate-500">
                      <p>{formatDateShort(c.validFrom)}</p>
                      <p className="text-slate-400">→ {formatDateShort(c.validUntil)}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                          c.status === 'ACTIVE'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : c.status === 'EXPIRED'
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : 'border-slate-200 bg-slate-100 text-slate-500'
                        }`}
                      >
                        {c.status === 'ACTIVE'
                          ? (isVi ? 'Đang áp dụng' : 'Active')
                          : c.status === 'EXPIRED'
                            ? (isVi ? 'Đã hết hạn' : 'Expired')
                            : (isVi ? 'Ngưng áp dụng' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => onEditCoupon?.(c)}
                          className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-blue-950 transition hover:bg-slate-100 disabled:opacity-50"
                        >
                          {isVi ? 'Sửa' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() => onDeleteCoupon?.(c.id)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold transition disabled:opacity-50 ${
                            c.status === 'ACTIVE'
                              ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {c.status === 'ACTIVE'
                            ? (isVi ? 'Tắt' : 'Disable')
                            : (isVi ? 'Bật' : 'Enable')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Phân trang */}
          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            totalElements={filteredCoupons.length}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize)
              setPage(0)
            }}
          />
        </div>
      )}
    </div>
  )
}