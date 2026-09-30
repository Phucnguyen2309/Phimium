/**
 * Reusable AdminPagination component.
 * Supports both BE server-side pagination and FE client-side pagination.
 *
 * Props:
 * - currentPage: 0-based page index (0, 1, 2...)
 * - totalPages: total number of pages (>= 1)
 * - totalElements: total number of items
 * - pageSize: items per page (e.g. 10, 20, 50)
 * - onPageChange: function(newPage0Based)
 * - onPageSizeChange: function(newPageSize) (optional)
 * - pageSizeOptions: array of number (default [10, 20, 50])
 */
import { useLanguage } from '@/context/languageContext.js'

export function AdminPagination({
  currentPage = 0,
  totalPages = 1,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  if (totalElements <= 0 && totalPages <= 1) {
    return null
  }

  const startItem = totalElements === 0 ? 0 : currentPage * pageSize + 1
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements)

  // Generate page numbers to display with smart ellipsis
  const getPageNumbers = () => {
    const pages = []
    const total = Math.max(1, totalPages)

    if (total <= 7) {
      for (let i = 0; i < total; i++) pages.push(i)
    } else {
      pages.push(0)
      if (currentPage > 2) {
        pages.push('ellipsis-left')
      }
      const start = Math.max(1, currentPage - 1)
      const end = Math.min(total - 2, currentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (currentPage < total - 3) {
        pages.push('ellipsis-right')
      }
      pages.push(total - 1)
    }
    return pages
  }

  const pages = getPageNumbers()

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3.5 sm:flex-row">
      {/* 1. Thông tin số lượng hiển thị */}
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span>
          {isVi ? (
            <>
              Hiển thị <strong className="font-bold text-slate-800">{startItem}</strong> -{' '}
              <strong className="font-bold text-slate-800">{endItem}</strong> trên tổng số{' '}
              <strong className="font-bold text-blue-950">{totalElements}</strong> kết quả
            </>
          ) : (
            <>
              Showing <strong className="font-bold text-slate-800">{startItem}</strong> -{' '}
              <strong className="font-bold text-slate-800">{endItem}</strong> of{' '}
              <strong className="font-bold text-blue-950">{totalElements}</strong> results
            </>
          )}
        </span>

        {/* Dropdown số dòng mỗi trang */}
        {onPageSizeChange && (
          <div className="hidden items-center gap-1.5 sm:flex">
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{isVi ? 'Mỗi trang:' : 'Per page:'}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-950"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 2. Điều hướng trang */}
      <div className="flex items-center gap-1">
        {/* Nút Trang trước */}
        <button
          type="button"
          disabled={currentPage <= 0}
          onClick={() => onPageChange?.(currentPage - 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          title={isVi ? 'Trang trước' : 'Previous page'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Các số trang */}
        {pages.map((p, idx) => {
          if (p === 'ellipsis-left' || p === 'ellipsis-right') {
            return (
              <span key={`ellipsis-${idx}`} className="flex h-8 w-6 items-center justify-center text-xs text-slate-400">
                …
              </span>
            )
          }

          const isCurrent = p === currentPage
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange?.(p)}
              className={`flex h-8 min-w-[32px] items-center justify-center rounded-lg px-2 text-xs font-bold transition ${
                isCurrent
                  ? 'bg-blue-950 text-white shadow-sm ring-1 ring-blue-950'
                  : 'border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-950'
              }`}
            >
              {p + 1}
            </button>
          )
        })}

        {/* Nút Trang sau */}
        <button
          type="button"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange?.(currentPage + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          title={isVi ? 'Trang sau' : 'Next page'}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </div>
  )
}
