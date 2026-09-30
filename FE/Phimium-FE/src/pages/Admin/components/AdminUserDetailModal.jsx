import { useEffect, useState } from 'react'
import adminService from '@/services/adminService.js'
import { UserAvatar } from '@/components/common'
import { formatDateTime } from '@/utils/format.js'
import { useLanguage } from '@/context/languageContext.js'

export function AdminUserDetailModal({ isOpen = true, userId, onClose }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen || !userId) {
      setUser(null)
      setError('')
      return
    }

    let isMounted = true
    const fetchUser = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await adminService.getUserById(userId)
        if (isMounted) {
          const data = res?.data?.data ?? res?.data ?? res
          setUser(data)
        }
      } catch (err) {
        if (isMounted) {
          console.error('Lỗi khi tải thông tin người dùng:', err)
          setError(isVi ? 'Không thể tải thông tin người dùng.' : 'Failed to load user details.')
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchUser()
    return () => {
      isMounted = false
    }
  }, [isOpen, userId, isVi])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={onClose} />
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl transition-all"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-yellow-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black text-blue-950">
                {isVi ? 'Thông tin người dùng' : 'User Details'}
              </h3>
              <p className="font-mono text-[11px] font-bold text-slate-400">
                UID: {String(userId).slice(0, 8)}...
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
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
              {isVi ? 'Đang tải dữ liệu hồ sơ...' : 'Loading profile data...'}
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-xs text-rose-600">
              {error}
            </div>
          ) : user ? (
            <div className="space-y-4">
              {/* Avatar + Name header */}
              <div className="flex flex-col items-center border-b border-slate-100 pb-4 text-center">
                <UserAvatar name={user.fullName} imageUrl={user.avatarUrl} size="lg" />
                <h4 className="mt-2.5 text-base font-black text-blue-950">{user.fullName || (isVi ? 'Người dùng' : 'User')}</h4>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 font-mono">
                    {user.role}
                  </span>
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
                      user.status === 'ACTIVE'
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-slate-100 text-slate-600'
                    }`}
                  >
                    {isVi
                      ? (user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Ngưng hoạt động')
                      : (user.status === 'ACTIVE' ? 'Active' : 'Inactive')}
                  </span>
                </div>
              </div>

              {/* Details table */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between rounded-lg bg-slate-50/70 p-2.5">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-semibold text-slate-900">{user.email || '—'}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50/70 p-2.5">
                  <span className="text-slate-400">{isVi ? 'Số điện thoại:' : 'Phone Number:'}</span>
                  <span className="font-semibold text-slate-900">{user.phone || '—'}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50/70 p-2.5">
                  <span className="text-slate-400">{isVi ? 'Mã định danh:' : 'User ID:'}</span>
                  <span className="font-mono text-[11px] text-slate-700">{user.userId || user.id}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-slate-50/70 p-2.5">
                  <span className="text-slate-400">{isVi ? 'Ngày tạo tài khoản:' : 'Created Date:'}</span>
                  <span className="text-slate-700">{formatDateTime(user.createdAt)}</span>
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
