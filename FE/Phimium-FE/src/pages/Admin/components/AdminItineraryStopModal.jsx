import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/languageContext.js'
import adminService from '@/services/adminService.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'

export function AdminItineraryStopModal({
  isOpen,
  onClose,
  activityId,
  stop = null, // null = tạo mới, object = chỉnh sửa
  onSuccess,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [offsetMinutes, setOffsetMinutes] = useState(0)
  const [durationMinutes, setDurationMinutes] = useState(45)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [removeExistingImage, setRemoveExistingImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef(null)

  const isEditing = Boolean(stop?.stopId)

  useEffect(() => {
    if (!isOpen) return

    if (stop) {
      setTitle(stop.title || stop.stopTitle || '')
      setDescription(stop.description || stop.stopDescription || '')
      setOffsetMinutes(Number(stop.offsetMinutes) || 0)
      setDurationMinutes(Number(stop.durationMinutes) || 45)
      setPreviewUrl(stop.imageUrl || '')
      setSelectedFile(null)
      setRemoveExistingImage(false)
    } else {
      setTitle('')
      setDescription('')
      setOffsetMinutes(0)
      setDurationMinutes(45)
      setSelectedFile(null)
      setPreviewUrl('')
      setRemoveExistingImage(false)
    }
    setErrorMsg('')
  }, [isOpen, stop])

  // Dọn dẹp blob URL khi unmount hoặc đổi file
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isVi ? 'Vui lòng chọn đúng tệp hình ảnh' : 'Please select a valid image file')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg(isVi ? 'Ảnh tối đa 10MB' : 'Image size must be under 10MB')
      return
    }

    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setRemoveExistingImage(false)
    setErrorMsg('')
  }

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl('')
    setRemoveExistingImage(true)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!title.trim()) {
      setErrorMsg(isVi ? 'Vui lòng nhập tên điểm dừng' : 'Please enter stop title')
      return
    }
    if (!description.trim()) {
      setErrorMsg(isVi ? 'Vui lòng nhập mô tả hoạt động tại điểm dừng' : 'Please enter description')
      return
    }
    if (offsetMinutes < 0 || offsetMinutes > 1440) {
      setErrorMsg(isVi ? 'Thời gian bắt đầu (offset) từ 0 đến 1440 phút' : 'Offset must be between 0 and 1440 mins')
      return
    }
    if (durationMinutes < 1 || durationMinutes > 1440) {
      setErrorMsg(isVi ? 'Thời lượng phải từ 1 đến 1440 phút' : 'Duration must be between 1 and 1440 mins')
      return
    }

    setSubmitting(true)

    try {
      const jsonPayload = {
        title: title.trim(),
        description: description.trim(),
        offsetMinutes: Number(offsetMinutes),
        durationMinutes: Number(durationMinutes),
        removeImage: isEditing ? removeExistingImage : false,
      }

      const formData = new FormData()
      // BE createStops nhận part "request" là List<ItineraryStopRequest>
      formData.append(
        'request',
        new Blob([JSON.stringify(isEditing ? jsonPayload : [jsonPayload])], {
          type: 'application/json',
        })
      )

      if (selectedFile) {
        formData.append('image', selectedFile)
      }

      let res
      if (isEditing) {
        res = await adminService.updateItineraryStop(activityId, stop.stopId, formData)
      } else {
        res = await adminService.createItineraryStop(activityId, formData)
      }

      const data = getResponseData(res)
      const result = Array.isArray(data) ? data[0] : data
      if (onSuccess) onSuccess(result)
      onClose()
    } catch (err) {
      const msg = getErrorMessage(err, isVi ? 'Không thể lưu điểm dừng. Vui lòng kiểm tra lại thời gian!' : 'Failed to save stop.')
      setErrorMsg(msg)
    } finally {
      setSubmitting(false)
    }
  }

  // Chuyển số phút offset sang định dạng giờ:phút minh hoạ
  const formatOffsetHelper = () => {
    const startH = Math.floor(offsetMinutes / 60)
    const startM = offsetMinutes % 60
    const endMinutes = Number(offsetMinutes) + Number(durationMinutes)
    const endH = Math.floor(endMinutes / 60)
    const endM = endMinutes % 60

    const pad = (n) => String(n).padStart(2, '0')
    return isVi
      ? `Sau khi tour khởi hành +${offsetMinutes}p (kéo dài ${durationMinutes}p, kết thúc ở phút thứ +${endMinutes})`
      : `+${offsetMinutes}m from departure (lasts ${durationMinutes}m, ends at +${endMinutes}m)`
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-blue-950">
              {isEditing
                ? (isVi ? 'Chỉnh sửa điểm dừng tour' : 'Edit Itinerary Stop')
                : (isVi ? 'Thêm điểm dừng mới vào lịch trình' : 'Add New Itinerary Stop')}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {isVi
                ? 'Lịch trình được sắp xếp tự động theo phút khởi hành'
                : 'Stops are ordered chronologically by offset minutes'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Tên điểm dừng */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isVi ? 'Tên điểm dừng *' : 'Stop Title *'}
            </label>
            <input
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isVi ? 'VD: Chùa Bà Thiên Hậu, Cà phê vợt Ba Lù...' : 'e.g. Ba Lu Coffee'}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-medium text-slate-800 outline-none transition focus:border-blue-950"
            />
          </div>

          {/* Thời gian: Offset & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isVi ? 'Bắt đầu sau giờ tour (phút) *' : 'Offset Minutes *'}
              </label>
              <input
                type="number"
                required
                min={0}
                max={1440}
                value={offsetMinutes}
                onChange={(e) => setOffsetMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 outline-none transition focus:border-blue-950"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {isVi ? '0 = Điểm tập trung đầu tiên' : '0 = First meeting point'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isVi ? 'Thời lượng tại điểm (phút) *' : 'Duration (Minutes) *'}
              </label>
              <input
                type="number"
                required
                min={1}
                max={1440}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-semibold text-slate-800 outline-none transition focus:border-blue-950"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                {isVi ? 'Thời gian dừng chân tại đây' : 'Time spent at this stop'}
              </span>
            </div>
          </div>

          {/* Dòng mô tả timeline trực quan */}
          <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-2.5 text-[11px] text-blue-900 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-600 shrink-0" />
            <span>{formatOffsetHelper()}</span>
          </div>

          {/* Mô tả điểm dừng */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isVi ? 'Mô tả hoạt động / trải nghiệm *' : 'Activity Description *'}
            </label>
            <textarea
              required
              rows={3}
              maxLength={1000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isVi ? 'Buddy giới thiệu nét kiến trúc, hỗ trợ chụp ảnh film và thưởng thức chè...' : 'Describe what guests will experience here...'}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-slate-800 outline-none transition focus:border-blue-950"
            />
            <span className="text-[10px] text-slate-400 text-right block">
              {description.length}/1000 ký tự
            </span>
          </div>

          {/* Upload ảnh đại diện điểm dừng */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isVi ? 'Ảnh đại diện điểm dừng (Tùy chọn)' : 'Stop Image (Optional)'}
            </label>

            {previewUrl ? (
              <div className="relative mt-2 h-44 w-full rounded-2xl overflow-hidden border border-slate-200 group">
                <img
                  src={previewUrl}
                  alt="Stop preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-blue-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-950 shadow-md hover:bg-slate-100"
                  >
                    {isVi ? 'Đổi ảnh khác' : 'Change Image'}
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-rose-700"
                  >
                    {isVi ? 'Xóa ảnh' : 'Remove Image'}
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-blue-950 hover:bg-slate-50 cursor-pointer transition"
              >
                <svg className="h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-xs font-bold text-blue-950">
                  {isVi ? 'Chọn ảnh cho điểm dừng' : 'Upload Stop Image'}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  PNG, JPG hoặc WEBP (Tối đa 10MB)
                </span>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* Footer nút hành động */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              {isVi ? 'Hủy' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 rounded-xl bg-blue-950 px-5 py-2 font-bold text-white shadow-md hover:bg-blue-900 transition disabled:opacity-50"
            >
              {submitting && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isEditing
                ? (isVi ? 'Cập nhật điểm dừng' : 'Update Stop')
                : (isVi ? 'Lưu điểm dừng' : 'Save Stop')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
