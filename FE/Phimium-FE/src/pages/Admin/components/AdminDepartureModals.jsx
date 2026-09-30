import { useEffect, useState } from 'react'
import adminService from '@/services/adminService.js'
import { getErrorMessage } from '@/utils/response.js'
import { useLanguage } from '@/context/languageContext.js'
import { formatDDMMYYYY } from '@/utils/format.js'

export function AdminAddDepartureModal({
  isOpen,
  activity,
  onClose,
  onSuccess,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [formData, setFormData] = useState({
    departureDate: '',
    startTime: '08:00',
    endTime: '11:30',
    capacity: '10',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFormData({
        departureDate: '',
        startTime: '08:00',
        endTime: '11:30',
        capacity: '10',
      })
      setError('')
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen || !activity) return null

  const handlePreventNegativeKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // 1. Kiểm tra ngày khởi hành
    if (!formData.departureDate) {
      setError(isVi ? 'Vui lòng chọn ngày khởi hành.' : 'Please select a departure date.')
      return
    }
    const today = new Date().toISOString().slice(0, 10)
    if (formData.departureDate < today) {
      setError(isVi ? 'Ngày khởi hành không được là ngày trong quá khứ.' : 'Departure date cannot be in the past.')
      return
    }

    // 2. Kiểm tra giờ kết thúc phải sau giờ bắt đầu
    if (formData.endTime <= formData.startTime) {
      setError(isVi ? 'Giờ kết thúc phải sau giờ bắt đầu.' : 'End time must be after start time.')
      return
    }

    // 3. Kiểm tra sức chứa (phải là số nguyên dương và >= số khách tối thiểu của tour)
    const capNum = Number(formData.capacity)
    if (!formData.capacity || isNaN(capNum) || !Number.isInteger(capNum) || capNum < 1) {
      setError(isVi ? 'Sức chứa phải là số nguyên từ 1 chỗ trở lên (không được âm hoặc bằng 0).' : 'Capacity must be an integer of 1 or greater.')
      return
    }

    const minRequired = Number(activity?.minimumParticipants || activity?.minParticipants || 2)
    if (capNum < minRequired) {
      setError(
        isVi
          ? `Sức chứa của ca (${capNum} chỗ) không được nhỏ hơn số khách tối thiểu để khởi hành tour (${minRequired} người).`
          : `Departure capacity (${capNum} seats) cannot be less than the tour's minimum participants (${minRequired} guests).`
      )
      return
    }

    try {
      setLoading(true)
      const payload = [
        {
          departureDate: formData.departureDate,
          startTime: formData.startTime.length === 5 ? `${formData.startTime}:00` : formData.startTime,
          endTime: formData.endTime.length === 5 ? `${formData.endTime}:00` : formData.endTime,
          capacity: capNum,
        },
      ]
      await adminService.createDepartures(activity.id, payload)
      onSuccess?.()
      onClose?.()
    } catch (err) {
      console.error('Lỗi tạo ca khởi hành:', err)
      setError(getErrorMessage(err, isVi ? 'Không thể tạo ca khởi hành. Vui lòng thử lại.' : 'Failed to create departure slot. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-950 focus:ring-1 focus:ring-blue-950'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={!loading ? onClose : undefined} />
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div>
            <h3 className="text-sm font-black text-blue-950">
              {isVi ? 'Thêm ca khởi hành mới' : 'Add New Departure Slot'}
            </h3>
            <p className="line-clamp-1 text-[11px] font-medium text-slate-400">{activity.title}</p>
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

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {activity?.minParticipants && (
            <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs text-blue-950">
              <span className="font-semibold text-slate-600">{isVi ? 'Yêu cầu khởi hành: ' : 'Departure requirement: '}</span>
              <span className="font-bold text-blue-950">
                {isVi ? `Tối thiểu ${activity.minParticipants} khách` : `Minimum ${activity.minParticipants} guests`}
              </span>
              <p className="mt-1 text-[11px] text-slate-500">
                {isVi
                  ? 'Sức chứa của ca này xác định số lượng khách tối đa có thể đăng ký tham gia ca.'
                  : 'Slot capacity defines the maximum number of guests that can book this departure.'}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700">
                {isVi ? 'Ngày khởi hành' : 'Departure Date'} <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.departureDate}
                onChange={(e) => setFormData((p) => ({ ...p, departureDate: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  {isVi ? 'Giờ bắt đầu' : 'Start Time'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData((p) => ({ ...p, startTime: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700">
                  {isVi ? 'Giờ kết thúc' : 'End Time'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData((p) => ({ ...p, endTime: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              {(() => {
                const minRequired = Number(activity?.minimumParticipants || activity?.minParticipants || 2)
                return (
                  <>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {isVi ? 'Sức chứa (số chỗ của ca)' : 'Slot Capacity (seats)'} <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={minRequired}
                      step="1"
                      required
                      onKeyDown={handlePreventNegativeKeys}
                      value={formData.capacity}
                      onChange={(e) => setFormData((p) => ({ ...p, capacity: e.target.value }))}
                      className={inputCls}
                      placeholder={isVi ? `Tối thiểu ${minRequired} chỗ` : `Min ${minRequired} seats`}
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      {isVi
                        ? `Số chỗ tối đa nhận khách cho ca này (tối thiểu từ ${minRequired} chỗ theo quy định của tour).`
                        : `Maximum capacity for this slot (must be at least ${minRequired} seats per tour settings).`}
                    </p>
                  </>
                )
              })()}
            </div>
          </div>

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
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl bg-blue-950 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-950/20 transition hover:bg-blue-900 disabled:opacity-50"
            >
              {loading && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              <span>
                {loading
                  ? (isVi ? 'Đang tạo ca...' : 'Creating slot...')
                  : (isVi ? 'Tạo ca khởi hành' : 'Create Departure')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function AdminEditCapacityModal({
  isOpen,
  departure,
  activity,
  onClose,
  onSuccess,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [capacity, setCapacity] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const reservedGuests = Number(departure?.reservedGuests || 0)
  const capNum = Number(capacity)

  useEffect(() => {
    if (isOpen && departure) {
      // Ưu tiên hiển thị Tổng sức chứa ban đầu của ca (tránh nhầm lẫn với số chỗ còn trống)
      const initialTotal = departure.totalCapacity > 0
        ? departure.totalCapacity
        : (Number(departure.capacity || 0) + Number(departure.reservedGuests || 0))
      setCapacity(String(initialTotal || 10))
      setError('')
    }
  }, [isOpen, departure])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, loading, onClose])

  if (!isOpen || !departure) return null

  const handlePreventNegativeKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!capacity || isNaN(capNum) || !Number.isInteger(capNum) || capNum < 1) {
      setError(isVi ? 'Sức chứa phải là số nguyên từ 1 chỗ trở lên (không được âm hoặc bằng 0).' : 'Capacity must be an integer of 1 or greater.')
      return
    }

    const minRequired = Number(activity?.minimumParticipants || activity?.minParticipants || 2)
    if (capNum < minRequired) {
      setError(
        isVi
          ? `Sức chứa mới (${capNum} chỗ) không được nhỏ hơn số khách tối thiểu để khởi hành tour (${minRequired} người).`
          : `New capacity (${capNum} seats) cannot be less than the tour's minimum participants (${minRequired} guests).`
      )
      return
    }

    if (reservedGuests > 0 && capNum < reservedGuests) {
      setError(
        isVi
          ? `Tổng sức chứa mới (${capNum} chỗ) không được nhỏ hơn số khách đã đặt vé (${reservedGuests} khách).`
          : `New capacity (${capNum} seats) cannot be less than already booked guests (${reservedGuests} guests).`
      )
      return
    }

    try {
      setLoading(true)
      await adminService.updateDepartureCapacity(departure.departureId, {
        totalCapacity: capNum,
      })
      onSuccess?.()
      onClose?.()
    } catch (err) {
      console.error('Lỗi cập nhật sức chứa:', err)
      setError(getErrorMessage(err, isVi ? 'Không thể cập nhật sức chứa. Vui lòng thử lại.' : 'Failed to update capacity. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-950 focus:ring-1 focus:ring-blue-950'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={!loading ? onClose : undefined} />
      <div
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-4">
          <h3 className="text-sm font-black text-blue-950">
            {isVi ? 'Điều chỉnh sức chứa ca' : 'Adjust Slot Capacity'}
          </h3>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {error && (
            <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div className="mb-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            <p className="font-semibold text-blue-950">
              {departure.startTime} – {departure.endTime}
            </p>
            <p className="mt-0.5 font-medium text-slate-500">
              {formatDDMMYYYY(departure.departureDate)}
            </p>
          </div>

          <div>
            {(() => {
              const minRequired = Number(activity?.minimumParticipants || activity?.minParticipants || 2)
              const minAllowed = Math.max(minRequired, reservedGuests)
              return (
                <>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Tổng sức chứa của ca (số chỗ mở bán)' : 'Total Slot Capacity (seats)'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={minAllowed}
                    step="1"
                    required
                    onKeyDown={handlePreventNegativeKeys}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className={inputCls}
                    placeholder={isVi ? `Tối thiểu ${minAllowed} chỗ` : `Min ${minAllowed} seats`}
                  />
                  {reservedGuests > 0 ? (
                    <div className="mt-2.5 rounded-xl border border-blue-100 bg-blue-50/70 p-2.5 text-xs text-blue-900">
                      <p className="font-bold text-blue-950">
                        {isVi ? `Đã có ${reservedGuests} khách đặt vé ở ca này` : `${reservedGuests} booked guests in this slot`}
                      </p>
                    </div>
                  ) : (
                    <p className="mt-1 text-[11px] text-slate-400">
                      {isVi
                        ? `Sức chứa của ca tối thiểu phải từ ${minRequired} chỗ (bằng hoặc lớn hơn số khách tối thiểu của tour).`
                        : `Slot capacity must be at least ${minRequired} seats (greater than or equal to tour's minimum participants).`}
                    </p>
                  )}
                </>
              )
            })()}
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1 rounded-xl bg-blue-950 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-900 disabled:opacity-50"
            >
              {loading && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
              <span>
                {loading
                  ? (isVi ? 'Đang lưu...' : 'Saving...')
                  : (isVi ? 'Lưu sức chứa' : 'Save Capacity')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
