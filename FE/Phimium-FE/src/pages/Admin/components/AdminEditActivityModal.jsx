import { useEffect, useState } from 'react'
import { getErrorMessage } from '@/utils/response.js'
import { useLanguage } from '@/context/languageContext.js'

const GET_TOUR_TYPE_OPTIONS = (isVi) => [
  { value: 'FOODTOUR', label: isVi ? 'Food Tour (Ẩm thực)' : 'Food Tour' },
  { value: 'HISTORYTOUR', label: isVi ? 'History Tour (Lịch sử - Văn hóa)' : 'History & Culture Tour' },
]

const GET_STATUS_OPTIONS = (isVi) => [
  { value: 'PUBLISHED', label: isVi ? 'Đang mở (PUBLISHED)' : 'Published (PUBLISHED)' },
  { value: 'UPCOMING', label: isVi ? 'Sắp diễn ra (UPCOMING)' : 'Upcoming (UPCOMING)' },
  { value: 'ONGOING', label: isVi ? 'Đang diễn ra (ONGOING)' : 'Ongoing (ONGOING)' },
  { value: 'COMPLETED', label: isVi ? 'Đã hoàn thành (COMPLETED)' : 'Completed (COMPLETED)' },
  { value: 'CANCELLED', label: isVi ? 'Đã hủy (CANCELLED)' : 'Cancelled (CANCELLED)' },
]

export function AdminEditActivityModal({
  isOpen,
  activity,
  onClose,
  onUpdate,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [formData, setFormData] = useState({
    title: '',
    activityType: 'FOODTOUR',
    description: '',
    thumbnailUrl: '',
    locationName: '',
    address: '',
    latitude: '',
    longitude: '',
    participationFee: '',
    childParticipationFee: '',
    minimumParticipants: '2',
    maximumParticipants: '12',
    groupMinSize: '2',
    groupMaxSize: '4',
    status: 'PUBLISHED',
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && activity) {
      setFormData({
        title: activity.title || '',
        activityType: activity.activityType || 'FOODTOUR',
        description: activity.description || '',
        thumbnailUrl: activity.thumbnailUrl || '',
        locationName: activity.locationName || '',
        address: activity.address || '',
        latitude: activity.latitude !== null && activity.latitude !== undefined ? String(activity.latitude) : '',
        longitude: activity.longitude !== null && activity.longitude !== undefined ? String(activity.longitude) : '',
        participationFee: activity.participationFee !== undefined ? String(activity.participationFee) : String(activity.price || 0),
        childParticipationFee: activity.childParticipationFee !== undefined ? String(activity.childParticipationFee) : '0',
        minimumParticipants: String(activity.minimumParticipants || activity.minParticipants || 2),
        maximumParticipants: String(activity.maximumParticipants || activity.maxParticipants || 12),
        groupMinSize: String(activity.groupMinSize || 2),
        groupMaxSize: String(activity.groupMaxSize || 4),
        status: activity.status || 'PUBLISHED',
      })
      setErrorMsg('')
    }
  }, [isOpen, activity])

  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, submitting, onClose])

  if (!isOpen || !activity) return null

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrorMsg('')
  }

  const handlePreventNegativeKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!formData.title.trim()) {
      setErrorMsg(isVi ? 'Tiêu đề tour không được để trống.' : 'Tour title cannot be empty.')
      return
    }
    if (!formData.locationName.trim() || !formData.address.trim()) {
      setErrorMsg(isVi ? 'Vui lòng nhập đầy đủ tên địa điểm và địa chỉ.' : 'Please enter both location name and address.')
      return
    }

    const adultFee = Number(formData.participationFee)
    if (isNaN(adultFee) || adultFee < 0) {
      setErrorMsg(isVi ? 'Phí người lớn phải là số không âm (>= 0).' : 'Adult fee must be a non-negative number.')
      return
    }

    const childFee = Number(formData.childParticipationFee || 0)
    if (isNaN(childFee) || childFee < 0) {
      setErrorMsg(isVi ? 'Phí trẻ em không được là số âm.' : 'Child fee cannot be negative.')
      return
    }
    if (childFee > adultFee) {
      setErrorMsg(isVi ? 'Phí tham gia của trẻ em không được vượt quá phí của người lớn.' : 'Child fee cannot exceed adult fee.')
      return
    }

    const minPart = Number(formData.minimumParticipants)
    if (isNaN(minPart) || !Number.isInteger(minPart) || minPart < 2) {
      setErrorMsg(isVi ? 'Số khách tối thiểu để khởi hành tour bắt buộc phải từ 2 người trở lên.' : 'Minimum participants must be at least 2.')
      return
    }

    let lat = null
    let lng = null
    if (formData.latitude !== '') {
      lat = Number(formData.latitude)
      if (isNaN(lat) || lat < -90 || lat > 90) {
        setErrorMsg(isVi ? 'Vĩ độ không hợp lệ (phải từ -90 đến 90).' : 'Invalid latitude (must be between -90 and 90).')
        return
      }
    }
    if (formData.longitude !== '') {
      lng = Number(formData.longitude)
      if (isNaN(lng) || lng < -180 || lng > 180) {
        setErrorMsg(isVi ? 'Kinh độ không hợp lệ (phải từ -180 đến 180).' : 'Invalid longitude (must be between -180 and 180).')
        return
      }
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description?.trim() || null,
      activityType: formData.activityType,
      thumbnailUrl: formData.thumbnailUrl?.trim() || null,
      locationName: formData.locationName.trim(),
      address: formData.address.trim(),
      latitude: lat,
      longitude: lng,
      participationFee: adultFee,
      childParticipationFee: childFee,
      minimumParticipants: minPart,
      maximumParticipants: Math.max(minPart, Number(activity?.maximumParticipants || 50)),
      groupMinSize: Number(formData.groupMinSize) || minPart,
      groupMaxSize: Number(formData.groupMaxSize) || Math.max(minPart, 4),
      status: formData.status,
    }

    try {
      setSubmitting(true)
      await onUpdate(activity.id, payload)
      onClose()
    } catch (err) {
      console.error('Lỗi cập nhật tour:', err)
      setErrorMsg(getErrorMessage(err, isVi ? 'Không thể cập nhật thông tin tour. Vui lòng kiểm tra lại.' : 'Failed to update tour details. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-950 focus:ring-1 focus:ring-blue-950'

  const tourTypeOptions = GET_TOUR_TYPE_OPTIONS(isVi)
  const statusOptions = GET_STATUS_OPTIONS(isVi)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      <div className="fixed inset-0 -z-10" onClick={!submitting ? onClose : undefined} />

      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-yellow-400 shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight text-blue-950">
                {isVi ? 'Chỉnh sửa tour / hoạt động trải nghiệm' : 'Edit Tour / Activity'}
              </h3>
              <p className="line-clamp-1 text-[11px] font-medium text-slate-400">
                ID: {activity.id}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {/* Form Body with Scroll */}
        <div className="max-h-[75vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {errorMsg && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* 1. THÔNG TIN CHUNG */}
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isVi ? '1. Thông tin chung' : '1. General Information'}
              </h4>
              <div className="space-y-3.5">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Tên tour / Hoạt động' : 'Tour / Activity Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder={isVi ? 'VD: Food Tour Đêm Khám Phá Ẩm Thực Chợ Lớn' : 'e.g. Night Food Tour in Cho Lon'}
                    className={inputClass}
                    maxLength={255}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {isVi ? 'Loại tour' : 'Tour Type'} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.activityType}
                      onChange={(e) => handleChange('activityType', e.target.value)}
                      className={inputClass}
                    >
                      {tourTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700">
                      {isVi ? 'Trạng thái xuất bản' : 'Publication Status'} <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleChange('status', e.target.value)}
                      className={inputClass}
                    >
                      {statusOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Mô tả chi tiết tour' : 'Tour Detailed Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder={isVi ? 'Giới thiệu hành trình, điểm đặc sắc, trải nghiệm ẩm thực...' : 'Introduce the itinerary, highlights, culinary experiences...'}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* 2. HÌNH ẢNH ĐẠI DIỆN */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isVi ? '2. Hình ảnh đại diện' : '2. Cover Image'}
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'URL hình ảnh đại diện (Thumbnail URL)' : 'Cover Image URL (Thumbnail URL)'}
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl}
                    onChange={(e) => handleChange('thumbnailUrl', e.target.value)}
                    placeholder="https://example.com/tour-image.jpg"
                    className={inputClass}
                  />
                </div>

                {formData.thumbnailUrl && (
                  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-2.5">
                    <img
                      src={formData.thumbnailUrl}
                      alt={isVi ? 'Xem trước ảnh tour' : 'Tour preview image'}
                      className="h-16 w-24 rounded-lg object-cover shadow-sm"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                    <div className="min-w-0 flex-1 text-[11px] text-slate-500">
                      <p className="font-semibold text-slate-700">{isVi ? 'Xem trước ảnh đại diện' : 'Cover image preview'}</p>
                      <p className="truncate text-slate-400">{formData.thumbnailUrl}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. ĐỊA ĐIỂM & TỌA ĐỘ */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isVi ? '3. Địa điểm & Tọa độ' : '3. Location & Coordinates'}
              </h4>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Tên địa điểm' : 'Location Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.locationName}
                    onChange={(e) => handleChange('locationName', e.target.value)}
                    placeholder={isVi ? 'VD: Khu phố cổ Chợ Lớn' : 'e.g. Old Cho Lon Chinatown'}
                    className={inputClass}
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Địa chỉ chi tiết' : 'Detailed Address'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder={isVi ? 'VD: 1105 Trần Hưng Đạo, P.5, Q.5, TP.HCM' : 'e.g. 1105 Tran Hung Dao, Ward 5, District 5, HCMC'}
                    className={inputClass}
                    maxLength={500}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Vĩ độ (Latitude)' : 'Latitude'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value)}
                    placeholder="10.762622"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Kinh độ (Longitude)' : 'Longitude'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value)}
                    placeholder="106.660172"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* 4. CHI PHÍ & QUY MÔ KHÁCH */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isVi ? '4. Chi phí & Quy mô khách' : '4. Pricing & Group Capacity'}
              </h4>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Phí tham gia người lớn' : 'Adult Participation Fee'} <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min="0"
                      max="1000000000"
                      step="1000"
                      onKeyDown={handlePreventNegativeKeys}
                      value={formData.participationFee}
                      onChange={(e) => handleChange('participationFee', e.target.value)}
                      placeholder="VD: 350000"
                      className={inputClass + ' pr-8'}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">₫</span>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Phí tham gia trẻ em (nếu có)' : 'Child Fee (if any)'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="1000000000"
                      step="1000"
                      onKeyDown={handlePreventNegativeKeys}
                      value={formData.childParticipationFee}
                      onChange={(e) => handleChange('childParticipationFee', e.target.value)}
                      placeholder="VD: 200000"
                      className={inputClass + ' pr-8'}
                    />
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">₫</span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Số khách tối thiểu để khởi hành' : 'Minimum Participants to Depart'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="2"
                    max="100"
                    step="1"
                    onKeyDown={handlePreventNegativeKeys}
                    value={formData.minimumParticipants}
                    onChange={(e) => handleChange('minimumParticipants', e.target.value)}
                    className={inputClass}
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    {isVi
                      ? 'Số khách tối thiểu để chuyến đi được khởi hành (quy định bắt buộc từ 2 người trở lên). Sức chứa từng ca khởi hành phải bằng hoặc lớn hơn số lượng này.'
                      : 'Minimum participants required to depart (must be at least 2 guests). Departure slot capacity must be greater than or equal to this number.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 -mx-6 -mb-6 flex items-center justify-end gap-3 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur-sm">
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {isVi ? 'Hủy bỏ' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-1.5 rounded-xl bg-blue-950 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-950/20 transition hover:bg-blue-900 active:scale-95 disabled:opacity-50"
              >
                {submitting && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>
                  {submitting
                    ? (isVi ? 'Đang lưu thay đổi...' : 'Saving changes...')
                    : (isVi ? 'Lưu thay đổi' : 'Save Changes')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
