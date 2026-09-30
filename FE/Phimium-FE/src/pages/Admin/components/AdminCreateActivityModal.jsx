import { useEffect, useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'
import { getErrorMessage } from '@/utils/response.js'

const DEFAULT_FORM = {
  title: '',
  activityType: 'FOODTOUR',
  description: '',
  locationName: '',
  address: '',
  latitude: '10.762622',
  longitude: '106.660172',
  participationFee: '',
  childParticipationFee: '',
  minimumParticipants: '2',
  maximumParticipants: '12',
  groupMinSize: '2',
  groupMaxSize: '4',
  registrationDeadline: '',
  status: 'PUBLISHED',
}

export function AdminCreateActivityModal({
  isOpen,
  onClose,
  onSubmit,
  actionLoading = false,
}) {
  const { language, t } = useLanguage()
  const isVi = language === 'vi'
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Reset form khi mở modal
  useEffect(() => {
    if (isOpen) {
      setFormData(DEFAULT_FORM)
      setImageFile(null)
      setImagePreview(null)
      setErrorMsg('')
    }
  }, [isOpen])

  // Đóng modal khi bấm ESC
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !actionLoading && !submitting) {
        onClose?.()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, actionLoading, submitting, onClose])

  if (!isOpen) return null

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setErrorMsg('')
  }

  // Chặn gõ dấu trừ (-) hoặc chữ 'e' trên các input số dương
  const handlePreventNegativeKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') {
      e.preventDefault()
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // 1. Kiểm tra tiêu đề và địa điểm
    if (!formData.title.trim()) {
      setErrorMsg(isVi ? 'Tiêu đề tour không được để trống.' : 'Tour title cannot be empty.')
      return
    }
    if (!formData.locationName.trim() || !formData.address.trim()) {
      setErrorMsg(isVi ? 'Vui lòng nhập đầy đủ tên địa điểm và địa chỉ.' : 'Please enter both location name and address.')
      return
    }

    // 2. Kiểm tra giá vé người lớn
    if (formData.participationFee === '') {
      setErrorMsg(isVi ? 'Phí tham gia người lớn không được để trống.' : 'Adult participation fee cannot be empty.')
      return
    }
    const adultFee = Number(formData.participationFee)
    if (isNaN(adultFee) || adultFee < 0) {
      setErrorMsg(isVi ? 'Giá vé người lớn không được là số âm.' : 'Adult fee cannot be negative.')
      return
    }
    if (adultFee > 1000000000) {
      setErrorMsg(isVi ? 'Giá vé người lớn không được vượt quá 1 tỷ đồng.' : 'Adult fee cannot exceed 1 billion VND.')
      return
    }

    // 3. Kiểm tra giá vé trẻ em (nếu có)
    let childFee
    if (formData.childParticipationFee !== '') {
      childFee = Number(formData.childParticipationFee)
      if (isNaN(childFee) || childFee < 0) {
        setErrorMsg(isVi ? 'Giá vé trẻ em không được là số âm.' : 'Child fee cannot be negative.')
        return
      }
      if (childFee > adultFee) {
        setErrorMsg(isVi ? 'Giá vé trẻ em không được lớn hơn giá vé người lớn.' : 'Child fee cannot exceed adult fee.')
        return
      }
    }

    // 4. Kiểm tra số khách tối thiểu (quy định từ 2 người trở lên)
    const minP = Number(formData.minimumParticipants)
    if (isNaN(minP) || !Number.isInteger(minP) || minP < 2) {
      setErrorMsg(isVi ? 'Số khách tối thiểu để khởi hành tour bắt buộc phải từ 2 người trở lên.' : 'Minimum participants must be at least 2.')
      return
    }
    if (minP > 100) {
      setErrorMsg(isVi ? 'Số khách tối thiểu không được vượt quá 100 người.' : 'Minimum participants cannot exceed 100.')
      return
    }

    // 5. Kiểm tra quy mô nhóm ghép
    const gMin = Number(formData.groupMinSize || 2)
    const gMax = Number(formData.groupMaxSize || 4)
    if (gMin < 1 || gMax < 1 || gMax < gMin) {
      setErrorMsg(isVi ? 'Quy mô nhóm không hợp lệ (nhóm tối thiểu >= 1 và nhóm tối đa >= nhóm tối thiểu).' : 'Invalid group size (min size >= 1 and max size >= min size).')
      return
    }

    // 6. Kiểm tra tọa độ
    const lat = Number(formData.latitude)
    const lng = Number(formData.longitude)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setErrorMsg(isVi ? 'Vĩ độ (latitude) phải nằm trong khoảng từ -90 đến 90.' : 'Latitude must be between -90 and 90.')
      return
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setErrorMsg(isVi ? 'Kinh độ (longitude) phải nằm trong khoảng từ -180 đến 180.' : 'Longitude must be between -180 and 180.')
      return
    }

    const payload = {
      title: formData.title.trim(),
      activityType: formData.activityType,
      description: formData.description.trim() || undefined,
      locationName: formData.locationName.trim(),
      address: formData.address.trim(),
      latitude: lat,
      longitude: lng,
      participationFee: adultFee,
      childParticipationFee: childFee,
      minimumParticipants: minP,
      maximumParticipants: Math.max(minP, 50),
      groupMinSize: gMin,
      groupMaxSize: gMax,
      registrationDeadline: formData.registrationDeadline
        ? formData.registrationDeadline.includes('T')
          ? formData.registrationDeadline
          : `${formData.registrationDeadline}T23:59:59`
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19),
      status: formData.status,
    }

    try {
      setSubmitting(true)
      await onSubmit({ data: payload, imageFile })
    } catch (err) {
      console.error('Lỗi khi tạo tour:', err)
      setErrorMsg(getErrorMessage(err, isVi ? 'Lỗi tạo tour mới. Vui lòng kiểm tra lại thông tin.' : 'Failed to create new tour. Please check inputs.'))
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 outline-none transition focus:border-blue-950 focus:ring-1 focus:ring-blue-950'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/60 p-4 backdrop-blur-sm">
      {/* Backdrop */}
      <div className="fixed inset-0 -z-10" onClick={!actionLoading ? onClose : undefined} />

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
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight text-blue-950">
                {isVi ? 'Tạo tour / hoạt động trải nghiệm mới' : 'Create New Activity / Tour'}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                {isVi ? 'Điền thông tin và hình ảnh đại diện để xuất bản tour mới' : 'Fill in the information and cover image to publish a new tour'}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={actionLoading}
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
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-semibold text-rose-700">
                {errorMsg}
              </div>
            )}

            {/* 1. THÔNG TIN CƠ BẢN */}
            <div>
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isVi ? '1. Thông tin chung' : '1. General Information'}
              </h4>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                {/* Tên tour */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Tên hoạt động / Tour' : 'Activity / Tour Name'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder={isVi ? 'VD: Food Tour Đêm Khám Phá Ẩm Thực Chợ Lớn' : 'e.g. Night Food Tour in Cho Lon'}
                    className={inputClass}
                    maxLength={200}
                  />
                </div>

                {/* Loại tour */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Loại tour' : 'Tour Type'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.activityType}
                    onChange={(e) => handleChange('activityType', e.target.value)}
                    className={inputClass}
                  >
                    <option value="FOODTOUR">FOODTOUR ({isVi ? 'Tour ẩm thực' : 'Food Tour'})</option>
                    <option value="HISTORYTOUR">HISTORYTOUR ({isVi ? 'Tour lịch sử / văn hóa' : 'Historical & Cultural Tour'})</option>
                  </select>
                </div>

                {/* Trạng thái ban đầu */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Trạng thái xuất bản' : 'Publication Status'} <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className={inputClass}
                  >
                    <option value="PUBLISHED">{isVi ? 'Đang mở đăng ký (PUBLISHED)' : 'Published (PUBLISHED)'}</option>
                    <option value="UPCOMING">{isVi ? 'Sắp diễn ra (UPCOMING)' : 'Upcoming (UPCOMING)'}</option>
                  </select>
                </div>

                {/* Mô tả */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Mô tả hoạt động' : 'Activity Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder={isVi ? 'Giới thiệu về trải nghiệm, những điểm độc đáo khách sẽ tham gia...' : 'Introduce the experience, highlights and unique spots...'}
                    className={inputClass + ' resize-none'}
                  />
                </div>

                {/* Ảnh đại diện / Thumbnail */}
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Ảnh đại diện tour' : 'Cover Image'}
                  </label>
                  {imagePreview ? (
                    <div className="relative inline-block overflow-hidden rounded-xl border border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-32 w-48 object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white shadow hover:bg-rose-700"
                        title={isVi ? 'Xóa ảnh' : 'Remove image'}
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:border-slate-400">
                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>{isVi ? 'Tải ảnh lên từ máy tính' : 'Upload from computer'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-slate-400">{isVi ? 'Hỗ trợ JPG, PNG, WEBP' : 'Supports JPG, PNG, WEBP'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 2. ĐỊA ĐIỂM */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isVi ? '2. Địa điểm & Tọa độ' : '2. Location & Coordinates'}
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
                    placeholder={isVi ? 'VD: Đường Hải Thượng Lãn Ông, Quận 5, TP.HCM' : 'e.g. Hai Thuong Lan Ong, District 5, HCMC'}
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

            {/* 3. CHI PHÍ & SỐ LƯỢNG NGƯỜI */}
            <div className="border-t border-slate-100 pt-4">
              <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {isVi ? '3. Chi phí & Quy mô khách' : '3. Pricing & Group Capacity'}
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

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-bold text-slate-700">
                    {isVi ? 'Hạn chót đăng ký tour' : 'Registration Deadline'} <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registrationDeadline}
                    onChange={(e) => handleChange('registrationDeadline', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                disabled={actionLoading}
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {t('admin.common.cancel')}
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="flex items-center gap-1.5 rounded-xl bg-blue-950 px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-950/20 transition hover:bg-blue-900 active:scale-95 disabled:opacity-50"
              >
                {actionLoading && (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                <span>
                  {actionLoading
                    ? (isVi ? 'Đang tạo tour...' : 'Creating tour...')
                    : (isVi ? 'Tạo tour mới' : 'Create New Tour')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
