import { useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'

// Helper format ngày thành DD-MM-YYYY
const formatDateDMY = (dateStr) => {
  if (!dateStr) return ''
  const parts = String(dateStr).split('-')
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`
  }
  return dateStr
}

// Helper format giờ thành HH:mm (bỏ giây :00)
const formatTimeHM = (timeStr) => {
  if (!timeStr) return ''
  return String(timeStr).slice(0, 5)
}

// Helper format thời gian điểm danh thành HH:mm DD-MM-YYYY
const formatDateTimeDMY = (isoStr) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  if (Number.isNaN(d.getTime())) return isoStr
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes} ${day}-${month}-${year}`
}

export function BuddyTourMembersModal({
  isOpen,
  onClose,
  departure,
  members = [],
  loading,
  error,
  onRefresh,
  onCheckIn,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'
  const [copiedPhone, setCopiedPhone] = useState(null)
  const [copiedAddress, setCopiedAddress] = useState(null)
  const [checkingInId, setCheckingInId] = useState(null)
  const [actionError, setActionError] = useState(null)

  if (!isOpen || !departure) return null

  const handleCopyPhone = (phone) => {
    if (!phone) return
    navigator.clipboard.writeText(phone)
    setCopiedPhone(phone)
    setTimeout(() => setCopiedPhone(null), 2000)
  }

  const handleCopyAddress = (address) => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const handleToggleCheckIn = async (registrationId) => {
    if (!onCheckIn) return
    setActionError(null)
    setCheckingInId(registrationId)
    try {
      await onCheckIn(registrationId)
    } catch (err) {
      setActionError(
        err?.response?.data?.message ||
          (isVi ? 'Không thể cập nhật điểm danh. Vui lòng thử lại!' : 'Failed to update attendance. Please try again!'),
      )
    } finally {
      setCheckingInId(null)
    }
  }

  const presentCount = members.filter((m) => m.checkInStatus === 'PRESENT').length
  const totalMembers = members.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-xl border border-slate-200 flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-slate-100 bg-slate-50 px-4 sm:px-6 py-3.5 sm:py-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-slate-500 font-mono">
              {formatDateDMY(departure.departureDate)} · {formatTimeHM(departure.startTime)} – {formatTimeHM(departure.endTime)}
            </div>
            <h3 className="mt-1 text-sm sm:text-base font-bold text-slate-900 truncate">
              {departure.activityTitle || (isVi ? 'Thông tin ca tour' : 'Tour Departure Info')}
            </h3>
            {departure.location && (
              <p className="mt-0.5 text-xs text-slate-500 truncate">{departure.location}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Attendance Summary Bar */}
        <div className="border-b border-slate-100 bg-white px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700">
            {isVi ? 'Đã đón / Có mặt:' : 'Picked up / Present:'}{' '}
            <span className="font-bold text-emerald-700">{presentCount}</span> / {totalMembers}{' '}
            {isVi ? 'khách' : 'guests'}
          </span>
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="font-semibold text-slate-600 hover:text-slate-900 transition disabled:opacity-50"
          >
            {loading ? (isVi ? 'Đang tải...' : 'Loading...') : (isVi ? 'Làm mới' : 'Refresh')}
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3">
          {copiedPhone && (
            <div className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white text-center">
              {isVi
                ? `Đã sao chép số điện thoại ${copiedPhone}`
                : `Copied phone number ${copiedPhone}`}
            </div>
          )}

          {copiedAddress && (
            <div className="rounded-lg bg-emerald-800 px-3 py-1.5 text-xs font-medium text-white text-center">
              {isVi
                ? `Đã sao chép địa chỉ đón`
                : `Copied pickup address`}
            </div>
          )}

          {(error || actionError) && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              {error || actionError}
            </div>
          )}

          {loading ? (
            <div className="space-y-2 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
              <p className="text-sm font-medium text-slate-500">
                {isVi
                  ? 'Chưa có khách đăng ký ca tour này.'
                  : 'No guests registered for this tour departure yet.'}
              </p>
            </div>
          ) : (
            members.map((m, idx) => {
              const isPresent = m.checkInStatus === 'PRESENT'
              const adult = Number(m.adultCount) || 0
              const child = Number(m.childCount) || 0
              const isUpdating = checkingInId === m.registrationId

              return (
                <div
                  key={m.registrationId || idx}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border gap-3 transition ${
                    isPresent
                      ? 'border-emerald-300 bg-emerald-50/30'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        {m.guestName || (isVi ? 'Khách trải nghiệm' : 'Participant')}
                      </span>
                      <span className="text-xs text-slate-500">
                        ({adult > 0 && `${adult} ${isVi ? 'người lớn' : 'adults'}`}
                        {adult > 0 && child > 0 && ', '}
                        {child > 0 && `${child} ${isVi ? 'trẻ em' : 'children'}`})
                      </span>
                    </div>

                    {/* Phone Contact */}
                    {m.phoneNumber && (
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <span className="font-mono text-slate-600">{m.phoneNumber}</span>
                        <a
                          href={`tel:${m.phoneNumber}`}
                          className="font-semibold text-emerald-700 hover:underline"
                        >
                          {isVi ? 'Gọi' : 'Call'}
                        </a>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(m.phoneNumber)}
                          className="font-semibold text-slate-500 hover:text-slate-800"
                        >
                          {isVi ? 'Sao chép' : 'Copy'}
                        </button>
                      </div>
                    )}

                    {/* Pickup Location with Google Maps directions */}
                    {m.pickupLocation && (
                      <div className="mt-2.5 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-slate-700 shadow-2xs">
                        <div className="flex items-start gap-2">
                          <span className="text-base leading-none text-amber-600 shrink-0">📍</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">
                              {isVi ? 'Địa chỉ đón khách' : 'Guest Pickup Address'}
                            </div>
                            <div className="text-xs font-semibold text-slate-900 break-words mt-1 leading-relaxed">
                              {m.pickupLocation}
                            </div>
                          </div>
                        </div>

                        {/* Actions: Google Maps & Copy */}
                        <div className="mt-2.5 pt-2 border-t border-amber-200/60 flex flex-wrap items-center gap-2 sm:gap-3">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              m.pickupLocation + (departure.location ? ` ${departure.location}` : ' Hồ Chí Minh'),
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 font-bold text-blue-700 hover:text-blue-900 hover:underline bg-white px-2.5 py-1.5 rounded-md border border-blue-200/80 shadow-2xs transition text-xs"
                          >
                            <svg className="w-3.5 h-3.5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {isVi ? 'Mở Google Maps chỉ đường' : 'Open in Google Maps'}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyAddress(m.pickupLocation)}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-950 font-semibold px-2 py-1.5"
                          >
                            <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            {isVi ? 'Sao chép' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Attendance Action */}
                  <div className="flex items-center justify-between sm:flex-col sm:items-end shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {isPresent ? (
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1">
                        <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          {isVi ? 'Đã đón' : 'Picked up'}
                        </span>
                        {m.checkedInAt && (
                          <div className="text-[10px] text-slate-400 font-mono">
                            {formatDateTimeDMY(m.checkedInAt)}
                          </div>
                        )}
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleToggleCheckIn(m.registrationId)}
                          className="text-[11px] text-slate-400 hover:text-rose-600 underline transition disabled:opacity-50"
                        >
                          {isUpdating ? '...' : (isVi ? 'Hủy đón' : 'Undo')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleToggleCheckIn(m.registrationId)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition disabled:opacity-50 w-full sm:w-auto"
                      >
                        {isUpdating ? (
                          <span className="animate-spin text-xs">⟳</span>
                        ) : (
                          <span>✓</span>
                        )}
                        {isVi ? 'Điểm danh / Đã đón' : 'Check in / Pick up'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
          >
            {isVi ? 'Đóng' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  )
}
