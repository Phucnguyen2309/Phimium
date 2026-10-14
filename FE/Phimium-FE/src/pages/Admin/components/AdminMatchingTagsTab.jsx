import { useCallback, useEffect, useState } from 'react'
import { useLanguage } from '@/context/languageContext.js'
import adminService from '@/services/adminService.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'

export function AdminMatchingTagsTab({ activity, onRefreshParent }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [catalogTags, setCatalogTags] = useState([])
  const [selectedTags, setSelectedTags] = useState(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const loadData = useCallback(async () => {
    if (!activity?.id) return
    setLoading(true)
    setErrorMsg('')
    try {
      // 1. Tải catalog
      const catRes = await adminService.getMatchingCatalog()
      const catData = getResponseData(catRes)
      const allTags = catData?.tags || []
      setCatalogTags(Array.isArray(allTags) ? allTags : [])

      // 2. Tải tag hiện tại của tour
      const tourRes = await adminService.getActivityMatchingTags(activity.id)
      const tourData = getResponseData(tourRes)
      const current = tourData?.tags || []
      setSelectedTags(new Set(current))
    } catch (err) {
      setErrorMsg(getErrorMessage(err, isVi ? 'Không thể tải danh sách tag' : 'Failed to load tags'))
    } finally {
      setLoading(false)
    }
  }, [activity?.id, isVi])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleTag = (code) => {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      if (next.has(code)) {
        next.delete(code)
      } else {
        next.add(code)
      }
      return next
    })
    setSuccessMsg('')
  }

  const handleSave = async () => {
    setSaving(true)
    setErrorMsg('')
    setSuccessMsg('')
    try {
      const tagList = Array.from(selectedTags)
      await adminService.updateActivityMatchingTags(activity.id, tagList)
      setSuccessMsg(isVi ? 'Đã lưu danh sách tag thành công!' : 'Tags updated successfully!')
      if (onRefreshParent) onRefreshParent()
    } catch (err) {
      setErrorMsg(getErrorMessage(err, isVi ? 'Lưu tag thất bại' : 'Failed to save tags'))
    } finally {
      setSaving(false)
    }
  }

  // Nhóm các tag theo danh mục (category)
  const groupedTags = catalogTags.reduce((acc, tag) => {
    const cat = tag.category || 'OTHER'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(tag)
    return acc
  }, {})

  // Lọc tag theo ô tìm kiếm
  const filteredTags = catalogTags.filter((t) => {
    const q = searchTerm.toLowerCase()
    return (
      t.code.toLowerCase().includes(q) ||
      (t.labelVi && t.labelVi.toLowerCase().includes(q)) ||
      (t.labelEn && t.labelEn.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-blue-950">
            {isVi ? 'Gắn thẻ sở thích & đặc trưng tour (AI Matching Tags)' : 'AI Matching Tags'}
          </span>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {isVi
              ? 'AI và hệ thống ghép tour sẽ dựa vào các thẻ này để giới thiệu tour cho khách phù hợp.'
              : 'Gemini AI will match this tour to guests based on these tags.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving || loading}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-950 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-900 active:scale-95 transition disabled:opacity-50"
          >
            {saving && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>{isVi ? 'Lưu thẻ đã chọn' : 'Save Tags'}</span>
            <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">
              {selectedTags.size}
            </span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 font-semibold">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 font-semibold flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Thanh tìm kiếm tag */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={isVi ? 'Tìm kiếm tag (nhiếp ảnh, ẩm thực, retro...)' : 'Search tags...'}
          className="w-full sm:max-w-xs rounded-xl border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-blue-950 transition"
        />
        {selectedTags.size > 0 && (
          <button
            type="button"
            onClick={() => setSelectedTags(new Set())}
            className="text-[11px] font-semibold text-rose-600 hover:underline shrink-0"
          >
            {isVi ? 'Bỏ chọn tất cả' : 'Clear all'}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-8 text-xs text-slate-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-950 border-t-transparent" />
          {isVi ? 'Đang tải danh mục tags...' : 'Loading tags...'}
        </div>
      ) : (
        /* Danh sách các tag dạng Pills */
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {searchTerm ? (
            /* Khi đang search thì hiện phẳng */
            <div className="flex flex-wrap gap-2">
              {filteredTags.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">
                  {isVi ? 'Không tìm thấy tag phù hợp' : 'No matching tags found'}
                </p>
              ) : (
                filteredTags.map((tag) => {
                  const isSelected = selectedTags.has(tag.code)
                  return (
                    <button
                      key={tag.code}
                      type="button"
                      onClick={() => toggleTag(tag.code)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-blue-950 text-white shadow-sm ring-2 ring-blue-950/20'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{isVi ? tag.labelVi || tag.code : tag.labelEn || tag.code}</span>
                      <span className="text-[10px] opacity-60">({tag.code})</span>
                    </button>
                  )
                })
              )}
            </div>
          ) : (
            /* Khi không search thì hiển thị theo Category */
            Object.entries(groupedTags).map(([category, tags]) => (
              <div key={category} className="rounded-2xl border border-slate-100 bg-slate-50/40 p-3.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-2">
                  {category}
                </span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const isSelected = selectedTags.has(tag.code)
                    return (
                      <button
                        key={tag.code}
                        type="button"
                        onClick={() => toggleTag(tag.code)}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-blue-950 text-white shadow-sm ring-2 ring-blue-950/20'
                            : 'border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span>{isSelected ? '✓' : '+'}</span>
                        <span>{isVi ? tag.labelVi || tag.code : tag.labelEn || tag.code}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
