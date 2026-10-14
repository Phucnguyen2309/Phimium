import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/context/languageContext.js'
import adminService from '@/services/adminService.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'

const GUIDING_STYLES = [
  {
    code: 'PHOTOGRAPHY_FOCUSED',
    labelVi: 'Chuyên chụp ảnh',
    labelEn: 'Photography Focused',
    descVi: 'Chụp ảnh đẹp, hướng dẫn tạo dáng, chọn góc sống ảo',
    descEn: 'Assists with poses, photo angles and capturing memories',
  },
  {
    code: 'INFORMATIVE',
    labelVi: 'Giàu kiến thức',
    labelEn: 'Informative & Cultural',
    descVi: 'Am hiểu sâu sắc về lịch sử, kiến trúc và văn hóa địa phương',
    descEn: 'Deep knowledge of local history, architecture and culture',
  },
  {
    code: 'ENGAGING',
    labelVi: 'Năng động & Hoạt náo',
    labelEn: 'Engaging & Vibrant',
    descVi: 'Hòa đồng, kết nối các thành viên, bầu không khí vui vẻ',
    descEn: 'Outgoing, creates vibrant and friendly vibes for groups',
  },
  {
    code: 'CALM',
    labelVi: 'Điềm đạm & Tận tâm',
    labelEn: 'Calm & Thoughtful',
    descVi: 'Nhịp điệu từ tốn, chu đáo, phù hợp khách thích sự yên bình',
    descEn: 'Gentle pace, attentive, great for mindful travelers',
  },
]

const POPULAR_LANGUAGES = [
  { code: 'VI', label: 'Tiếng Việt' },
  { code: 'EN', label: 'English' },
  { code: 'ZH', label: '中文 (Chinese)' },
  { code: 'JA', label: '日本語 (Japanese)' },
  { code: 'KR', label: '한국어 (Korean)' },
  { code: 'FR', label: 'Français (French)' },
]

export function AdminUpgradeBuddyModal({
  isOpen,
  user,
  onClose,
  onSuccess,
  onError,
}) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  const [bio, setBio] = useState('')
  const [experience, setExperience] = useState('')
  const [introduction, setIntroduction] = useState('')
  const [guidingStyle, setGuidingStyle] = useState('PHOTOGRAPHY_FOCUSED')
  const [selectedLanguages, setSelectedLanguages] = useState(['VI', 'EN'])
  const [skills, setSkills] = useState([])
  const [skillInput, setSkillInput] = useState('')
  const [selectedInterests, setSelectedInterests] = useState([])
  const [catalogTags, setCatalogTags] = useState([])

  const [avatarFile, setAvatarFile] = useState(null)
  const [previewAvatar, setPreviewAvatar] = useState('')

  const [loadingTags, setLoadingTags] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const fileInputRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    setBio(user?.bio || '')
    setExperience(isVi ? 'Có kinh nghiệm dẫn khách du lịch và yêu thích nhiếp ảnh đường phố.' : 'Experience guiding local walking tours and street photography.')
    setIntroduction(isVi ? 'Xin chào! Mình rất vui được đồng hành cùng bạn khám phá từng góc phố thân thuộc.' : 'Hi! Excited to explore Saigon hidden gems with you.')
    setGuidingStyle('PHOTOGRAPHY_FOCUSED')
    setSelectedLanguages(['VI', 'EN'])
    setSkills(['Hỗ trợ chụp ảnh bằng điện thoại', 'Hiểu văn hóa địa phương'])
    setSkillInput('')
    setSelectedInterests(['PHOTOGRAPHY', 'RETRO', 'CAFE'])
    setAvatarFile(null)
    setPreviewAvatar(user?.avatarUrl || '')
    setErrorMsg('')

    // Tải catalog tag
    const fetchCatalog = async () => {
      setLoadingTags(true)
      try {
        const res = await adminService.getMatchingCatalog()
        const data = getResponseData(res)
        if (Array.isArray(data?.tags)) {
          setCatalogTags(data.tags)
        }
      } catch {
        // fallback
      } finally {
        setLoadingTags(false)
      }
    }
    fetchCatalog()
  }, [isOpen, user, isVi])

  useEffect(() => {
    return () => {
      if (previewAvatar && previewAvatar.startsWith('blob:')) {
        URL.revokeObjectURL(previewAvatar)
      }
    }
  }, [previewAvatar])

  if (!isOpen || !user) return null

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrorMsg(isVi ? 'Vui lòng chọn tệp hình ảnh hợp lệ' : 'Please select an image')
      return
    }

    if (previewAvatar && previewAvatar.startsWith('blob:')) {
      URL.revokeObjectURL(previewAvatar)
    }

    setAvatarFile(file)
    setPreviewAvatar(URL.createObjectURL(file))
  }

  const toggleLanguage = (code) => {
    setSelectedLanguages((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const toggleInterest = (code) => {
    setSelectedInterests((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault()
      const val = skillInput.trim()
      if (val && !skills.includes(val)) {
        setSkills([...skills, val])
        setSkillInput('')
      }
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!bio.trim()) {
      setErrorMsg(isVi ? 'Vui lòng nhập tiểu sử (Bio)' : 'Bio is required')
      return
    }
    if (!experience.trim()) {
      setErrorMsg(isVi ? 'Vui lòng nhập kinh nghiệm' : 'Experience is required')
      return
    }
    if (!introduction.trim()) {
      setErrorMsg(isVi ? 'Vui lòng nhập lời giới thiệu' : 'Introduction is required')
      return
    }
    if (selectedLanguages.length === 0) {
      setErrorMsg(isVi ? 'Chọn ít nhất 1 ngôn ngữ' : 'Select at least one language')
      return
    }

    setSubmitting(true)

    try {
      const validCodes = new Set(
        catalogTags.length > 0
          ? catalogTags.map((t) => t.code)
          : [
              'PHOTOGRAPHY', 'FOOD', 'HISTORY', 'ARCHITECTURE', 'LOCAL_CULTURE',
              'SNACKS', 'STREET_FOOD', 'CHINESE_CUISINE', 'TRADITIONAL_FOOD',
              'CAFE', 'OLD_NEIGHBORHOODS', 'HERITAGE', 'HIDDEN_GEMS', 'RETRO',
              'CHILL', 'LIVELY',
            ]
      )
      const sanitizedInterests = selectedInterests.filter((t) => validCodes.has(t))

      const jsonPayload = {
        bio: bio.trim(),
        experience: experience.trim(),
        introduction: introduction.trim(),
        guidingStyle,
        languages: selectedLanguages,
        skills,
        interests: sanitizedInterests,
      }

      const formData = new FormData()
      formData.append(
        'request',
        new Blob([JSON.stringify(jsonPayload)], { type: 'application/json' })
      )

      if (avatarFile) {
        formData.append('image', avatarFile)
      }

      const res = await adminService.upgradeUserToBuddy(user.id, formData)
      const data = getResponseData(res)
      if (onSuccess) onSuccess(data, user)
      onClose()
    } catch (err) {
      const msg = getErrorMessage(err, isVi ? 'Nâng cấp Buddy thất bại' : 'Failed to upgrade buddy')
      setErrorMsg(msg)
      if (onError) onError(err, msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-white font-bold shadow-sm">
              <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-black text-blue-950">
                {isVi ? 'Nâng cấp thành Buddy' : 'Upgrade to Buddy'}
              </h3>
              <p className="text-xs text-slate-500">
                {isVi ? 'Tạo hồ sơ dẫn tour & phân quyền Buddy cho nhân viên' : 'Create guide profile and assign Buddy role'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Thông tin User được chọn */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-blue-50/70 border border-blue-100 p-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-white border border-blue-200 shrink-0">
            {previewAvatar ? (
              <img src={previewAvatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-blue-950 text-sm bg-yellow-300">
                {user.fullName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-blue-950 truncate">{user.fullName || user.email}</p>
            <p className="text-[11px] text-slate-500 truncate">{user.email} • {user.phone || 'Chưa có SĐT'}</p>
          </div>
          <span className="rounded-full bg-blue-200/80 px-2.5 py-0.5 text-[10px] font-bold text-blue-950">
            Role: USER ➔ BUDDY
          </span>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          {/* Phong cách dẫn tour */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {isVi ? '1. Phong cách dẫn tour chủ đạo (Guiding Style) *' : '1. Guiding Style *'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GUIDING_STYLES.map((style) => {
                const isSelected = guidingStyle === style.code
                return (
                  <button
                    key={style.code}
                    type="button"
                    onClick={() => setGuidingStyle(style.code)}
                    className={`flex items-start gap-2.5 rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-blue-950 bg-blue-950 text-white shadow-md'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-blue-950'}`}>
                        {isVi ? style.labelVi : style.labelEn}
                      </p>
                      <p className={`text-[10px] mt-0.5 leading-snug ${isSelected ? 'text-blue-200' : 'text-slate-500'}`}>
                        {isVi ? style.descVi : style.descEn}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Ngoại ngữ */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              {isVi ? '2. Ngoại ngữ thông thạo *' : '2. Languages *'}
            </label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_LANGUAGES.map((lang) => {
                const isSelected = selectedLanguages.includes(lang.code)
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-bold transition ${
                      isSelected
                        ? 'bg-blue-950 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{lang.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Kỹ năng chuyên biệt */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isVi ? '3. Kỹ năng cá nhân' : '3. Special Skills'}
            </label>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                placeholder={isVi ? 'Nhập kỹ năng rồi bấm Thêm (VD: Hỗ trợ chụp góc rộng, Kể chuyện lịch sử...)' : 'Add a skill...'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-950 transition"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 font-bold text-slate-700 hover:bg-slate-200 shrink-0"
              >
                + {isVi ? 'Thêm' : 'Add'}
              </button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-700"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(s)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Sở thích / Thẻ Matching Tags */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isVi ? '4. Sở thích & Gu tour phù hợp (Matching Tags)' : '4. Interests & Tags'}
            </label>
            {loadingTags ? (
              <p className="text-slate-400 text-[11px]">{isVi ? 'Đang tải tags...' : 'Loading tags...'}</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl">
                {catalogTags.slice(0, 20).map((tag) => {
                  const isSelected = selectedInterests.includes(tag.code)
                  return (
                    <button
                      key={tag.code}
                      type="button"
                      onClick={() => toggleInterest(tag.code)}
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                        isSelected
                          ? 'bg-amber-400 text-blue-950 font-bold shadow-sm'
                          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{isSelected ? '✓' : '+'}</span>
                      <span>{isVi ? tag.labelVi || tag.code : tag.labelEn || tag.code}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Bio, Experience, Introduction */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isVi ? '5. Tiểu sử (Bio) *' : '5. Bio *'}
              </label>
              <textarea
                required
                rows={2}
                maxLength={1000}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={isVi ? 'Giới thiệu ngắn gọn về sở trường và đam mê dẫn tour...' : 'Tell about passion and background...'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-950 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isVi ? '6. Kinh nghiệm dẫn tour *' : '6. Experience *'}
              </label>
              <textarea
                required
                rows={2}
                maxLength={1000}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder={isVi ? 'Kinh nghiệm dẫn khách, kinh nghiệm nhiếp ảnh...' : 'Tour guiding experience...'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-950 transition"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {isVi ? '7. Lời giới thiệu gửi tới khách hàng *' : '7. Introduction *'}
              </label>
              <textarea
                required
                rows={2}
                maxLength={1000}
                value={introduction}
                onChange={(e) => setIntroduction(e.target.value)}
                placeholder={isVi ? 'Lời chào thân thiện hiển thị trên trang hồ sơ và kết quả AI Matchmaker...' : 'Welcome message shown to guests...'}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-950 transition"
              />
            </div>
          </div>

          {/* Ảnh đại diện Buddy (tùy chọn) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              {isVi ? 'Ảnh đại diện chân dung Buddy (Tùy chọn tải mới)' : 'Portrait Photo (Optional)'}
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                {avatarFile ? avatarFile.name : (isVi ? 'Chọn ảnh chân dung mới' : 'Choose portrait file')}
              </button>
              {avatarFile && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarFile(null)
                    setPreviewAvatar(user?.avatarUrl || '')
                  }}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  {isVi ? 'Bỏ chọn' : 'Clear'}
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
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
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 px-6 py-2 font-bold text-white shadow-md hover:from-blue-900 hover:to-indigo-800 transition disabled:opacity-50"
            >
              {submitting && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
              {isVi ? 'Xác nhận nâng cấp thành Buddy' : 'Confirm Upgrade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
