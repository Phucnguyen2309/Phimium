import { useEffect, useState } from 'react'

import { useLanguage } from '@/context/languageContext.js'
import { getErrorMessage } from '@/utils/response.js'

const DEFAULT_FORM = {
  code: '',
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minimumOrderAmount: '',
  maximumDiscountAmount: '',
  validFrom: '',
  validUntil: '',
  usageLimit: '',
}

export function AdminCouponModal({
  isOpen,
  onClose,
  onSubmit,
  actionLoading,
  initialData = null,
}) {
  const { language, t } = useLanguage()
  const isVi = language === 'vi'
  const isEditing = Boolean(initialData?.id)
  const [formData, setFormData] = useState(DEFAULT_FORM)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Populate data khi mở modal (tạo mới hoặc chỉnh sửa)
  useEffect(() => {
    if (!isOpen) return
    setErrorMsg('')
    if (initialData) {
      setFormData({
        code: initialData.code || '',
        name: initialData.name || '',
        description: initialData.description || '',
        discountType: initialData.discountType || 'PERCENTAGE',
        discountValue: initialData.discountValue != null ? String(initialData.discountValue) : '',
        minimumOrderAmount: initialData.minimumOrderAmount ? String(initialData.minimumOrderAmount) : '',
        maximumDiscountAmount: initialData.maximumDiscountAmount ? String(initialData.maximumDiscountAmount) : '',
        validFrom: initialData.validFrom ? String(initialData.validFrom).slice(0, 10) : '',
        validUntil: initialData.validUntil ? String(initialData.validUntil).slice(0, 10) : '',
        usageLimit: initialData.usageLimit ? String(initialData.usageLimit) : '',
      })
    } else {
      setFormData(DEFAULT_FORM)
    }
  }, [isOpen, initialData])

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

  // Chặn gõ dấu trừ (-) hoặc chữ 'e' trên các input số
  const handlePreventNegativeKeys = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') {
      e.preventDefault()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    // 1. Kiểm tra mã coupon
    const trimmedCode = formData.code.trim().toUpperCase()
    if (!trimmedCode) {
      setErrorMsg(isVi ? 'Mã coupon không được để trống.' : 'Coupon code cannot be empty.')
      return
    }
    if (/\s/.test(trimmedCode)) {
      setErrorMsg(isVi ? 'Mã coupon không được chứa khoảng trắng.' : 'Coupon code cannot contain spaces.')
      return
    }

    // 2. Kiểm tra mức giảm giá (số âm, 0, min, max)
    const dVal = Number(formData.discountValue)
    if (!formData.discountValue || isNaN(dVal) || dVal <= 0) {
      setErrorMsg(isVi ? 'Mức giảm giá phải là số dương lớn hơn 0.' : 'Discount value must be greater than 0.')
      return
    }

    if (formData.discountType === 'PERCENTAGE') {
      if (dVal > 100) {
        setErrorMsg(isVi ? 'Phần trăm giảm giá không được vượt quá 100%.' : 'Percentage discount cannot exceed 100%.')
        return
      }
    } else if (formData.discountType === 'FIXED_AMOUNT') {
      if (dVal < 1000) {
        setErrorMsg(isVi ? 'Số tiền giảm giá cố định tối thiểu là 1,000₫.' : 'Fixed discount must be at least 1,000₫.')
        return
      }
      if (dVal > 1000000000) {
        setErrorMsg(isVi ? 'Số tiền giảm giá không được vượt quá 1 tỷ đồng.' : 'Discount cannot exceed 1 billion VND.')
        return
      }
    }

    // 3. Kiểm tra đơn hàng tối thiểu (không được âm)
    if (formData.minimumOrderAmount) {
      const minOrder = Number(formData.minimumOrderAmount)
      if (isNaN(minOrder) || minOrder < 0) {
        setErrorMsg(isVi ? 'Giá trị đơn tối thiểu không được là số âm.' : 'Minimum order amount cannot be negative.')
        return
      }
    }

    // 4. Kiểm tra mức giảm tối đa (không được âm)
    if (formData.discountType === 'PERCENTAGE' && formData.maximumDiscountAmount) {
      const maxDiscount = Number(formData.maximumDiscountAmount)
      if (isNaN(maxDiscount) || maxDiscount < 0) {
        setErrorMsg(isVi ? 'Mức giảm tối đa không được là số âm.' : 'Maximum discount cannot be negative.')
        return
      }
    }

    // 5. Kiểm tra thời gian hiệu lực
    if (!formData.validFrom || !formData.validUntil) {
      setErrorMsg(isVi ? 'Vui lòng chọn đầy đủ thời gian bắt đầu và kết thúc.' : 'Please select both start and expiration dates.')
      return
    }
    if (formData.validUntil < formData.validFrom) {
      setErrorMsg(isVi ? 'Thời gian hết hạn phải sau hoặc bằng thời gian bắt đầu.' : 'Expiration date must be after or equal to start date.')
      return
    }

    // 6. Kiểm tra giới hạn số lượt dùng (phải là số nguyên dương >= 1)
    if (formData.usageLimit) {
      const uLimit = Number(formData.usageLimit)
      if (isNaN(uLimit) || !Number.isInteger(uLimit) || uLimit < 1) {
        setErrorMsg(isVi ? 'Giới hạn sử dụng phải là số nguyên từ 1 trở lên.' : 'Usage limit must be an integer of 1 or greater.')
        return
      }
      if (uLimit > 10000000) {
        setErrorMsg(isVi ? 'Giới hạn sử dụng tối đa là 10,000,000 lượt.' : 'Usage limit cannot exceed 10,000,000.')
        return
      }
    }

    // Map chính xác sang CreateCouponRequest / UpdateCouponRequest của BE
    const payload = {
      code: trimmedCode,
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      discountType: formData.discountType,
      discountValue: dVal,
      minimumOrderAmount: formData.minimumOrderAmount ? Number(formData.minimumOrderAmount) : undefined,
      maximumDiscountAmount:
        formData.discountType === 'PERCENTAGE' && formData.maximumDiscountAmount
          ? Number(formData.maximumDiscountAmount)
          : undefined,
      validFrom: formData.validFrom ? `${formData.validFrom}T00:00:00` : undefined,
      validUntil: formData.validUntil ? `${formData.validUntil}T23:59:59` : undefined,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
    }
    if (isEditing && initialData?.status) {
      payload.status = initialData.status
    }

    try {
      setSubmitting(true)
      await onSubmit(payload)
    } catch (err) {
      console.error('Lỗi gửi coupon:', err)
      setErrorMsg(getErrorMessage(err, isVi ? 'Lỗi lưu mã coupon. Vui lòng thử lại.' : 'Failed to save coupon. Please try again.'))
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
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-yellow-400 shadow-sm">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.386a9.07 9.07 0 003.54-3.54c.486-.827.313-1.908-.386-2.607l-9.581-9.581A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-black tracking-tight text-blue-950">
                {isEditing ? (isVi ? 'Chỉnh sửa mã giảm giá' : 'Edit Coupon') : t('admin.coupons.modalTitle')}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                {isEditing
                  ? (isVi ? `Cập nhật thông tin mã ${initialData?.code || ''}` : `Update details for coupon ${initialData?.code || ''}`)
                  : (isVi ? 'Điền đầy đủ thông tin để tạo mã giảm giá mới' : 'Fill in the information to create a new coupon')}
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

        {/* Form body — scroll nếu màn hình nhỏ */}
        <div className="max-h-[70vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6">
            {errorMsg && (
              <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0 text-rose-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1 font-medium">{errorMsg}</div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* 1. Mã Coupon */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Mã coupon' : 'Coupon Code'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                  placeholder="VD: HELLOSUMMER2026"
                  className={inputClass + ' font-mono tracking-wider uppercase'}
                  maxLength={50}
                />
              </div>

              {/* 2. Tên coupon */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Tên khuyến mãi' : 'Promotion Name'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder={isVi ? 'VD: Chào hè 2026' : 'e.g. Summer Special 2026'}
                  className={inputClass}
                  maxLength={200}
                />
              </div>

              {/* 3. Loại giảm giá */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Loại giảm giá' : 'Discount Type'} <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.discountType}
                  onChange={(e) => handleChange('discountType', e.target.value)}
                  className={inputClass}
                >
                  <option value="PERCENTAGE">{isVi ? 'Phần trăm (%)' : 'Percentage (%)'}</option>
                  <option value="FIXED_AMOUNT">{isVi ? 'Số tiền cố định (₫)' : 'Fixed Amount (₫)'}</option>
                </select>
              </div>

              {/* 4. Mức giảm */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Mức giảm' : 'Discount Value'} <span className="text-rose-500">*</span>
                  {formData.discountType === 'PERCENTAGE' && (
                    <span className="ml-1 text-[11px] font-normal text-slate-400">
                      {isVi ? '(tối đa 100%)' : '(max 100%)'}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={formData.discountType === 'PERCENTAGE' ? '0.1' : '1000'}
                    max={formData.discountType === 'PERCENTAGE' ? '100' : '1000000000'}
                    step={formData.discountType === 'PERCENTAGE' ? '0.1' : '1000'}
                    onKeyDown={handlePreventNegativeKeys}
                    value={formData.discountValue}
                    onChange={(e) => handleChange('discountValue', e.target.value)}
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'VD: 15' : 'VD: 50000'}
                    className={inputClass + ' pr-10'}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">
                    {formData.discountType === 'PERCENTAGE' ? '%' : '₫'}
                  </span>
                </div>
              </div>

              {/* 5. Đơn tối thiểu */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Đơn hàng tối thiểu' : 'Minimum Order Amount'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    onKeyDown={handlePreventNegativeKeys}
                    value={formData.minimumOrderAmount}
                    onChange={(e) => handleChange('minimumOrderAmount', e.target.value)}
                    placeholder="VD: 200000"
                    className={inputClass + ' pr-8'}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">₫</span>
                </div>
              </div>

              {/* 6. Giảm tối đa (chỉ khi PERCENTAGE) */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Giảm tối đa' : 'Maximum Discount'}
                  {formData.discountType === 'FIXED_AMOUNT' && (
                    <span className="ml-1 text-slate-300">{isVi ? '(không áp dụng)' : '(not applicable)'}</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    onKeyDown={handlePreventNegativeKeys}
                    disabled={formData.discountType === 'FIXED_AMOUNT'}
                    value={formData.maximumDiscountAmount}
                    onChange={(e) => handleChange('maximumDiscountAmount', e.target.value)}
                    placeholder="VD: 100000"
                    className={inputClass + ' pr-8 disabled:bg-slate-50 disabled:text-slate-300'}
                  />
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-bold text-slate-400">₫</span>
                </div>
              </div>

              {/* 7. Từ ngày */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Bắt đầu từ' : 'Valid From'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.validFrom}
                  onChange={(e) => handleChange('validFrom', e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* 8. Đến ngày */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Hết hạn vào' : 'Valid Until'} <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.validUntil}
                  min={formData.validFrom || undefined}
                  onChange={(e) => handleChange('validUntil', e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* 9. Giới hạn lượt dùng */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Giới hạn số lượt dùng' : 'Usage Limit'}
                </label>
                <input
                  type="number"
                  min="1"
                  max="10000000"
                  step="1"
                  onKeyDown={handlePreventNegativeKeys}
                  value={formData.usageLimit}
                  onChange={(e) => handleChange('usageLimit', e.target.value)}
                  placeholder={isVi ? 'VD: 100 (bỏ trống = không giới hạn)' : 'e.g. 100 (leave empty for unlimited)'}
                  className={inputClass}
                />
              </div>

              {/* 10. Mô tả */}
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-700">
                  {isVi ? 'Mô tả điều kiện áp dụng' : 'Terms & Conditions'}
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder={isVi ? 'VD: Giảm 15% tối đa 100k cho đơn từ 200k trong tháng 6' : 'e.g. 15% discount up to 100k for orders from 200k'}
                  className={inputClass + ' resize-none'}
                />
              </div>
            </div>

            {/* Nút hành động */}
            <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
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
                    ? isEditing
                      ? (isVi ? 'Đang lưu...' : 'Saving...')
                      : (isVi ? 'Đang tạo...' : 'Creating...')
                    : isEditing
                      ? (isVi ? 'Lưu thay đổi' : 'Save Changes')
                      : t('admin.common.save')}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}