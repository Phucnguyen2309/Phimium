import { useCallback, useEffect, useState } from 'react'
import { notification } from 'antd'
import { useLanguage } from '@/context/languageContext.js'
import aiService from '@/services/aiService.js'
import buddyService from '@/services/buddyService.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'

const GUIDING_STYLES = [
  {
    key: 'PHOTOGRAPHY_FOCUSED',
    labelVi: 'Chuyên chụp ảnh',
    labelEn: 'Photography Focused',
    descVi: 'Biết canh góc, bắt sáng, am hiểu các điểm chụp ảnh đẹp và hỗ trợ du khách lưu giữ kỷ niệm.',
    descEn: 'Skilled in photo angles, lighting, and helping guests capture retro aesthetic moments.',
  },
  {
    key: 'INFORMATIVE',
    labelVi: 'Giàu kiến thức',
    labelEn: 'Informative & Cultural',
    descVi: 'Am hiểu sâu sắc về lịch sử di tích, kiến trúc cổ xưa và những câu chuyện truyền thống địa phương.',
    descEn: 'Deep knowledge of local history, heritage architecture, and authentic cultural stories.',
  },
  {
    key: 'ENGAGING',
    labelVi: 'Năng động & Hoạt náo',
    labelEn: 'Engaging & Vibrant',
    descVi: 'Hoạt bát, cởi mở, kết nối các thành viên trong đoàn và tạo không khí vui tươi, hào hứng.',
    descEn: 'Enthusiastic, conversational, creating lively connections and cheerful vibes.',
  },
  {
    key: 'CALM',
    labelVi: 'Điềm đạm & Tận tâm',
    labelEn: 'Calm & Thoughtful',
    descVi: 'Nhịp điệu từ tốn, chu đáo, tinh tế quan sát và chăm sóc cảm xúc của du khách suốt hành trình.',
    descEn: 'Paced, observant, gentle care and dedicated attention to every guest need.',
  },
]

const POPULAR_LANGUAGES = [
  { code: 'VI', labelVi: 'Tiếng Việt', labelEn: 'Vietnamese' },
  { code: 'EN', labelVi: 'English (Tiếng Anh)', labelEn: 'English' },
  { code: 'ZH', labelVi: '中文 (Tiếng Trung)', labelEn: 'Chinese' },
  { code: 'JA', labelVi: '日本語 (Tiếng Nhật)', labelEn: 'Japanese' },
  { code: 'KO', labelVi: '한국어 (Tiếng Hàn)', labelEn: 'Korean' },
  { code: 'FR', labelVi: 'Français (Tiếng Pháp)', labelEn: 'French' },
]

export function BuddyMatchingTab({ buddyId }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Form states
  const [guidingStyle, setGuidingStyle] = useState('PHOTOGRAPHY_FOCUSED')
  const [interests, setInterests] = useState([])
  const [languages, setLanguages] = useState(['VI'])
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')

  // Catalog tags from server
  const [catalogTags, setCatalogTags] = useState([])

  // Load initial profile & catalog
  const loadProfile = useCallback(async () => {
    if (!buddyId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setErrorMessage('')

    try {
      const [profileRes, catalogRes] = await Promise.all([
        buddyService.getMatchingProfile(buddyId).catch(() => null),
        aiService.getMatchingCatalog().catch(() => null),
      ])

      const profile = getResponseData(profileRes)
      const catalog = getResponseData(catalogRes)

      if (Array.isArray(catalog?.tags)) {
        setCatalogTags(catalog.tags)
      }

      if (profile) {
        if (profile.guidingStyle) setGuidingStyle(profile.guidingStyle)
        if (Array.isArray(profile.interests)) setInterests(profile.interests)
        if (Array.isArray(profile.languages)) setLanguages(profile.languages)
        if (Array.isArray(profile.skills)) setSkills(profile.skills)
      }
    } catch (err) {
      console.error('Lỗi tải hồ sơ Buddy matching:', err)
      setErrorMessage(getErrorMessage(err, isVi ? 'Không thể tải hồ sơ matching' : 'Failed to load matching profile'))
    } finally {
      setLoading(false)
    }
  }, [buddyId, isVi])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  const toggleInterest = (code) => {
    setInterests((prev) =>
      prev.includes(code)
        ? prev.filter((t) => t !== code)
        : prev.length < 16
        ? [...prev, code]
        : prev
    )
  }

  const toggleLanguage = (code) => {
    setLanguages((prev) =>
      prev.includes(code)
        ? prev.length > 1
          ? prev.filter((l) => l !== code)
          : prev // Ít nhất 1 ngôn ngữ
        : [...prev, code]
    )
  }

  const addSkill = () => {
    const trimmed = skillInput.trim()
    if (!trimmed) return
    if (!skills.includes(trimmed) && skills.length < 20) {
      setSkills((prev) => [...prev, trimmed])
      setSkillInput('')
    }
  }

  const removeSkill = (skillToRemove) => {
    setSkills((prev) => prev.filter((s) => s !== skillToRemove))
  }

  const handleSave = async (e) => {
    e?.preventDefault()
    if (!buddyId) return

    setSaving(true)
    setSaveSuccess('')
    setErrorMessage('')

    try {
      const payload = {
        guidingStyle,
        interests,
        skills,
        languages,
      }

      const res = await buddyService.updateMatchingProfile(buddyId, payload)
      const updated = getResponseData(res)

      if (updated) {
        if (updated.guidingStyle) setGuidingStyle(updated.guidingStyle)
        if (Array.isArray(updated.interests)) setInterests(updated.interests)
        if (Array.isArray(updated.languages)) setLanguages(updated.languages)
        if (Array.isArray(updated.skills)) setSkills(updated.skills)
      }

      const successMsg = isVi
        ? 'Hồ sơ Matching của bạn đã được cập nhật thành công!'
        : 'Your matching profile has been saved successfully!'

      setSaveSuccess(successMsg)
      notification.success({
        message: isVi ? 'Cập nhật thành công' : 'Update Successful',
        description: successMsg,
        placement: 'topRight',
        duration: 4,
      })

      setTimeout(() => setSaveSuccess(''), 5000)
    } catch (err) {
      console.error('Lỗi lưu hồ sơ matching:', err)
      const errText = getErrorMessage(
        err,
        isVi ? 'Không thể lưu hồ sơ matching' : 'Failed to save matching profile'
      )
      setErrorMessage(errText)
      notification.error({
        message: isVi ? 'Cập nhật thất bại' : 'Save Failed',
        description: errText,
        placement: 'topRight',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 py-8">
        <div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-44 rounded-2xl bg-slate-100 animate-pulse" />
        <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Thông báo Thành công / Thất bại */}
      {saveSuccess && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center justify-between animate-fade-in shadow-2xs">
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-emerald-900 font-black">
              ✓
            </span>
            <span>{saveSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveSuccess('')}
            className="text-emerald-500 hover:text-emerald-800 font-black ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-800 flex items-center justify-between animate-fade-in shadow-2xs">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-rose-500 hover:text-rose-800 font-black ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. Gu / Phong cách hướng dẫn */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-blue-950">
              {isVi ? '1. Phong cách hướng dẫn (Guiding Style) *' : '1. Guiding Style *'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isVi
                ? 'AI sẽ ưu tiên ghép cặp bạn với những du khách đang tìm kiếm phong cách này.'
                : 'AI prioritizes matching you with guests looking for this particular style.'}
            </p>
          </div>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-bold text-blue-950">
            {GUIDING_STYLES.find((s) => s.key === guidingStyle)?.[isVi ? 'labelVi' : 'labelEn'] || guidingStyle}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {GUIDING_STYLES.map((style) => {
            const isSelected = guidingStyle === style.key
            return (
              <div
                key={style.key}
                onClick={() => setGuidingStyle(style.key)}
                className={`cursor-pointer rounded-2xl p-4 border transition ${
                  isSelected
                    ? 'border-blue-950 bg-blue-50/40 ring-1 ring-blue-950 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-xs font-black ${isSelected ? 'text-blue-950' : 'text-slate-800'}`}>
                    {isVi ? style.labelVi : style.labelEn}
                  </span>
                  <div
                    className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-950 bg-blue-950 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-yellow-400" />}
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {isVi ? style.descVi : style.descEn}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2. Thẻ sở thích & Thế mạnh tour */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-black text-blue-950">
              {isVi ? '2. Thẻ sở trường & Điểm chung (Matching Tags)' : '2. Matching Interests & Tags'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isVi
                ? 'Chọn các chủ đề bạn tự tin và yêu thích nhất khi đồng hành cùng du khách.'
                : 'Select the themes you are most passionate and confident in guiding.'}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 self-start sm:self-auto">
            {isVi ? `Đã chọn: ${interests.length} / 16 thẻ` : `Selected: ${interests.length} / 16 tags`}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-3 border border-slate-100 rounded-2xl bg-slate-50/50">
          {catalogTags.map((tag) => {
            const isSelected = interests.includes(tag.code)
            return (
              <button
                key={tag.code}
                type="button"
                onClick={() => toggleInterest(tag.code)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-amber-400 text-blue-950 font-bold shadow-2xs'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isSelected ? '✓ ' : '+ '}
                {isVi ? tag.labelVi || tag.code : tag.labelEn || tag.code}
              </button>
            )
          })}
        </div>
      </div>

      {/* 3. Ngôn ngữ giao tiếp */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-2xs">
        <div>
          <h3 className="text-sm font-black text-blue-950">
            {isVi ? '3. Ngôn ngữ có thể hướng dẫn (Languages) *' : '3. Fluent Guiding Languages *'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isVi
              ? 'AI sẽ chỉ ghép bạn với các du khách yêu cầu ngôn ngữ mà bạn thành thạo.'
              : 'AI ensures you only receive tours with guests speaking your fluent languages.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {POPULAR_LANGUAGES.map((lang) => {
            const isSelected = languages.includes(lang.code)
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => toggleLanguage(lang.code)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-950 text-white shadow-2xs ring-1 ring-blue-950'
                    : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                <span>{isSelected ? '✓' : '+'}</span>
                <span>{isVi ? lang.labelVi : lang.labelEn}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* 4. Kỹ năng cá nhân */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-2xs">
        <div>
          <h3 className="text-sm font-black text-blue-950">
            {isVi ? '4. Kỹ năng & Điểm mạnh cá nhân (Skills)' : '4. Personal Skills & Strengths'}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {isVi
              ? 'Thêm các kỹ năng đặc biệt của bạn (VD: Chụp ảnh điện thoại, Giao tiếp tiếng Quảng Đông, Sơ cấp cứu,...)'
              : 'Add your special skills (e.g., Portrait phone photography, Local Cantonese dialect, First aid,...)'}
          </p>
        </div>

        {/* Input thêm skill */}
        <div className="flex gap-2">
          <input
            type="text"
            maxLength={100}
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSkill()
              }
            }}
            placeholder={
              isVi
                ? 'Nhập kỹ năng rồi bấm Thêm hoặc phím Enter...'
                : 'Type a skill and press Add or Enter...'
            }
            className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-blue-950 transition"
          />
          <button
            type="button"
            onClick={addSkill}
            className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-xs font-bold text-slate-800 transition shrink-0"
          >
            {isVi ? '+ Thêm' : '+ Add'}
          </button>
        </div>

        {/* Danh sách skills */}
        <div className="flex flex-wrap gap-2 pt-1 min-h-[36px]">
          {skills.length === 0 ? (
            <p className="text-xs text-slate-400 italic">
              {isVi ? 'Chưa có kỹ năng nào được thêm.' : 'No skills added yet.'}
            </p>
          ) : (
            skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-800"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-slate-400 hover:text-rose-600 font-bold ml-0.5"
                >
                  ✕
                </button>
              </span>
            ))
          )}
        </div>
      </div>

      {/* Nút Submit */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={loadProfile}
          disabled={saving}
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
        >
          {isVi ? 'Hoàn tác / Tải lại' : 'Reset'}
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-blue-950 px-6 py-2.5 text-xs font-black text-yellow-400 shadow-md hover:bg-blue-900 transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span>{isVi ? 'Đang lưu hồ sơ...' : 'Saving...'}</span>
            </>
          ) : (
            <>
              <span>{isVi ? 'Lưu hồ sơ Matching' : 'Save Matching Profile'}</span>
              <span>✓</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}
