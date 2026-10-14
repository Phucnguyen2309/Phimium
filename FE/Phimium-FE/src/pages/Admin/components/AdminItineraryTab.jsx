import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '@/context/languageContext.js'
import adminService from '@/services/adminService.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'
import { AdminItineraryStopModal } from './AdminItineraryStopModal.jsx'
import { AdminConfirmModal } from './AdminConfirmModal.jsx'

export function AdminItineraryTab({ activity, onRefreshParent }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [stops, setStops] = useState([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStop, setEditingStop] = useState(null)
  const [deletingStop, setDeletingStop] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchStops = useCallback(async () => {
    if (!activity?.id) return
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await adminService.getItineraryStops(activity.id)
      const data = getResponseData(res)
      setStops(Array.isArray(data) ? data : [])
    } catch (err) {
      setErrorMsg(getErrorMessage(err, isVi ? 'Không thể tải lịch trình' : 'Failed to load itinerary'))
    } finally {
      setLoading(false)
    }
  }, [activity?.id, isVi])

  useEffect(() => {
    fetchStops()
  }, [fetchStops])

  const handleDeleteStop = async () => {
    if (!deletingStop) return
    setActionLoading(true)
    try {
      await adminService.deleteItineraryStop(activity.id, deletingStop.stopId)
      setDeletingStop(null)
      fetchStops()
      if (onRefreshParent) onRefreshParent()
    } catch (err) {
      alert(getErrorMessage(err, isVi ? 'Xóa điểm dừng thất bại' : 'Failed to delete stop'))
    } finally {
      setActionLoading(false)
    }
  }

  const handleClearImage = async (stopId) => {
    if (!window.confirm(isVi ? 'Bạn có chắc chắn muốn bỏ ảnh của điểm dừng này?' : 'Remove image for this stop?')) {
      return
    }
    setActionLoading(true)
    try {
      await adminService.deleteItineraryStopImage(activity.id, stopId)
      fetchStops()
    } catch (err) {
      alert(getErrorMessage(err, isVi ? 'Bỏ ảnh thất bại' : 'Failed to clear image'))
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Top Header of Tab */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-blue-950">
            {isVi ? 'Các chặng dừng chân của tour' : 'Tour Itinerary Stops'}
          </span>
          <span className="ml-2 text-[11px] text-slate-400">
            ({stops.length} {isVi ? 'điểm dừng' : 'stops'})
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingStop(null)
            setIsModalOpen(true)
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-950 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-900 active:scale-95 transition"
        >
          <span className="font-black text-sm">+</span>
          <span>{isVi ? 'Thêm điểm dừng' : 'Add Stop'}</span>
        </button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
          {isVi ? 'Đang tải lịch trình điểm dừng...' : 'Loading itinerary stops...'}
        </div>
      ) : stops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-950 mb-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <p className="text-xs font-bold text-blue-950">
            {isVi ? 'Chưa có điểm dừng nào được tạo' : 'No itinerary stops created yet'}
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
            {isVi
              ? 'Tạo các chặng dừng chân kèm thời gian và hình ảnh để khách nắm rõ lịch trình và phục vụ gợi ý tour bằng AI.'
              : 'Add stops with photos and timeline so guests understand the journey and Gemini AI can match.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingStop(null)
              setIsModalOpen(true)
            }}
            className="mt-3 inline-flex items-center gap-1 rounded-xl bg-yellow-400 px-3.5 py-1.5 text-xs font-bold text-blue-950 shadow-sm hover:bg-yellow-300"
          >
            + {isVi ? 'Thêm điểm đầu tiên' : 'Add First Stop'}
          </button>
        </div>
      ) : (
        /* Timeline dọc hiển thị điểm dừng */
        <div className="relative pl-6 space-y-6 before:absolute before:bottom-3 before:top-3 before:left-2.5 before:w-0.5 before:bg-gradient-to-b before:from-blue-950 before:via-blue-300 before:to-slate-200">
          {stops.map((stop, index) => {
            const orderNum = stop.stopOrder !== undefined ? stop.stopOrder + 1 : index + 1
            const offset = Number(stop.offsetMinutes) || 0
            const duration = Number(stop.durationMinutes) || 0

            return (
              <div key={stop.stopId || index} className="relative group">
                {/* Node số thứ tự trên timeline */}
                <div className="absolute -left-6 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-[10px] font-black text-white shadow-sm ring-4 ring-white">
                  {orderNum}
                </div>

                {/* Card nội dung chặng dừng */}
                <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      {/* Badge timeline */}
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold text-blue-950">
                          {isVi ? `Bắt đầu: +${offset} phút` : `Start: +${offset} mins`}
                        </span>
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {duration} {isVi ? 'phút' : 'mins'}
                        </span>
                      </div>

                      {/* Tên điểm dừng */}
                      <h4 className="text-sm font-extrabold text-blue-950">
                        {stop.title || stop.stopTitle}
                      </h4>

                      {/* Mô tả */}
                      <p className="mt-1 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {stop.description || stop.stopDescription}
                      </p>
                    </div>

                    {/* Ảnh đại diện nếu có */}
                    {stop.imageUrl && (
                      <div className="relative shrink-0 w-24 h-24 sm:w-28 sm:h-20 rounded-xl overflow-hidden border border-slate-200 group/img">
                        <img
                          src={stop.imageUrl}
                          alt={stop.title}
                          className="h-full w-full object-cover transition duration-300 group-hover/img:scale-105"
                        />
                        <button
                          type="button"
                          onClick={() => handleClearImage(stop.stopId)}
                          title={isVi ? 'Bỏ ảnh điểm dừng' : 'Remove stop image'}
                          className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/70 text-white text-[10px] hover:bg-rose-600 opacity-0 group-hover/img:opacity-100 transition"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingStop(stop)
                        setIsModalOpen(true)
                      }}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold text-blue-950 hover:bg-slate-50 transition"
                    >
                      {isVi ? 'Sửa' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingStop(stop)}
                      className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      {isVi ? 'Xóa' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Thêm / Sửa điểm dừng */}
      <AdminItineraryStopModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingStop(null)
        }}
        activityId={activity.id}
        stop={editingStop}
        onSuccess={() => {
          fetchStops()
          if (onRefreshParent) onRefreshParent()
        }}
      />

      {/* Modal xác nhận xóa */}
      <AdminConfirmModal
        isOpen={Boolean(deletingStop)}
        title={isVi ? 'Xác nhận xóa điểm dừng' : 'Confirm Delete Stop'}
        message={
          isVi
            ? `Bạn có chắc muốn xóa điểm dừng "${deletingStop?.title || deletingStop?.stopTitle}" khỏi tour? Các điểm dừng sau sẽ được tự động đánh lại số thứ tự.`
            : `Are you sure you want to delete this stop? Remaining stops will be reindexed automatically.`
        }
        confirmText={isVi ? 'Xóa điểm dừng' : 'Delete Stop'}
        cancelText={isVi ? 'Hủy' : 'Cancel'}
        onConfirm={handleDeleteStop}
        onClose={() => setDeletingStop(null)}
        loading={actionLoading}
        variant="danger"
      />
    </div>
  )
}
