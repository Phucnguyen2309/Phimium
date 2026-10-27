import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/authContext.js'
import { useLanguage } from '@/context/languageContext.js'
import aiService from '@/services/aiService.js'
import paymentService from '@/services/paymentService.js'
import registrationService from '@/services/registrationService.js'
import { submitCheckoutForm } from '@/utils/checkout.js'
import { formatDDMMYYYY, formatMoney } from '@/utils/format.js'
import { getErrorMessage, getResponseData } from '@/utils/response.js'
import { buildActivityDetailPath, ROUTES } from '@/routes/paths.js'

// Gợi ý nhanh: chữ hiển thị và câu gửi cho AI đều theo ngôn ngữ (locales: aiMatch.quickPrompts.*)
const QUICK_PROMPTS = ['retroFood', 'history', 'chillCafe', 'streetFood']

const GUIDING_STYLES = ['PHOTOGRAPHY_FOCUSED', 'INFORMATIVE', 'ENGAGING', 'CALM']

export function AiMatchmakerModal({ isOpen, onClose }) {
  const { language, t } = useLanguage()
  // Chỉ dùng cho dữ liệu song ngữ do Backend trả (labelVi / labelEn của thẻ sở thích)
  const isVi = language === 'vi'
  const { user } = useAuth()
  const navigate = useNavigate()

  // Form input states
  const [inputMode, setInputMode] = useState('prompt') // 'prompt' | 'tags'
  const [message, setMessage] = useState('')
  const [selectedTags, setSelectedTags] = useState([])
  const [date, setDate] = useState(() => {
    const tomorrow = new Date(Date.now() + 86400000)
    return tomorrow.toISOString().split('T')[0]
  })
  const [earliestStartTime, setEarliestStartTime] = useState('')
  const [latestEndTime, setLatestEndTime] = useState('')
  const [adultCount, setAdultCount] = useState(1)
  const [childCount, setChildCount] = useState(0)
  const [guidingStyle, setGuidingStyle] = useState('')
  const [requiredLanguage, setRequiredLanguage] = useState('VI')
  const [maxTotalBudget, setMaxTotalBudget] = useState('')

  // Catalog tags from server
  const [catalogTags, setCatalogTags] = useState([])

  // Matching & Result states
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [matchResult, setMatchResult] = useState(null)

  // Booking step states
  const [selectedChoice, setSelectedChoice] = useState(null)
  const [pickupLocation, setPickupLocation] = useState('')
  const [isSafetyAccepted, setIsSafetyAccepted] = useState(false)
  const [showSafetyPolicyModal, setShowSafetyPolicyModal] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [bookingError, setBookingError] = useState('')

  // Tải catalog tags khi modal mở
  useEffect(() => {
    if (!isOpen) return
    const fetchCatalog = async () => {
      try {
        const res = await aiService.getMatchingCatalog()
        const data = getResponseData(res)
        if (Array.isArray(data?.tags)) {
          setCatalogTags(data.tags)
        }
      } catch {
        // ignore
      }
    }
    fetchCatalog()
  }, [isOpen])

  // Reset states & lock body scroll khi mở/đóng modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
      setMatchResult(null)
      setSelectedChoice(null)
      setSearchError('')
      setBookingError('')
      setIsSearching(false)
      setIsBooking(false)
      setShowSafetyPolicyModal(false)
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Đóng modal khi bấm phím ESC
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const toggleTag = (code) => {
    setSelectedTags((prev) =>
      prev.includes(code) ? prev.filter((t) => t !== code) : [...prev, code]
    )
  }

  const handleSearch = async (e) => {
    e?.preventDefault()
    setSearchError('')

    if (!user) {
      setSearchError(
        t('aiMatch.pleaseLogInToUse')
      )
      return
    }

    if (inputMode === 'prompt' && !message.trim() && selectedTags.length === 0) {
      setSearchError(
        t('aiMatch.pleaseEnterYourTourRequest')
      )
      return
    }

    if (inputMode === 'tags' && selectedTags.length === 0) {
      setSearchError(
        t('aiMatch.pleaseSelectAtLeast1')
      )
      return
    }

    if (!date) {
      setSearchError(t('aiMatch.pleaseSelectADate'))
      return
    }

    setIsSearching(true)
    setMatchResult(null)
    setSelectedChoice(null)

    try {
      const payload = {
        date,
        adultCount: Number(adultCount) || 1,
        childCount: Number(childCount) || 0,
        locale: language,
      }

      if (inputMode === 'prompt' && message.trim()) {
        payload.message = message.trim()
      }

      if (selectedTags.length > 0) {
        payload.tags = selectedTags
      }

      if (earliestStartTime) {
        payload.earliestStartTime = earliestStartTime.length === 5 ? `${earliestStartTime}:00` : earliestStartTime
      }
      if (latestEndTime) {
        payload.latestEndTime = latestEndTime.length === 5 ? `${latestEndTime}:00` : latestEndTime
      }
      if (guidingStyle) {
        payload.guidingStyle = guidingStyle
      }
      if (requiredLanguage) {
        payload.requiredLanguage = requiredLanguage
      }
      if (maxTotalBudget && Number(maxTotalBudget) > 0) {
        payload.maxTotalBudget = Number(maxTotalBudget)
      }

      const res = await aiService.matchTours(payload)
      const data = getResponseData(res)
      setMatchResult(data)
    } catch (err) {
      console.error('Lỗi tìm kiếm AI Matchmaker:', err)
      const code = err?.response?.data?.code
      if (code === 6001) {
        setSearchError(
          t('aiMatch.aiEngineNotConfiguredPlease')
        )
      } else if (code === 6002) {
        setSearchError(
          t('aiMatch.aiProviderIsTemporarilyUnavailable')
        )
      } else {
        setSearchError(getErrorMessage(err, t('aiMatch.matchingFailed')))
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleStartBooking = (choice) => {
    if (!choice) return
    const activityId = choice.activity?.activityId || choice.activity?.id
    if (!activityId) return

    const departureId = choice.departure?.departureId || choice.departure?.id
    const departureDate = choice.departure?.departureDate || date

    onClose?.()
    navigate(buildActivityDetailPath(activityId), {
      state: {
        departureId,
        selectedDate: departureDate,
        departureDate,
        adultCount: Number(adultCount) || 1,
        childCount: Number(childCount) || 0,
        pickupLocation: pickupLocation?.trim() || '',
        matchResultId: choice.matchResultId,
        aiMatch: choice,
      },
    })
  }

  const handleConfirmBooking = (e) => {
    e?.preventDefault()
    if (!selectedChoice) return
    handleStartBooking(selectedChoice)
  }

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.()
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header với phong cách AI hiện đại */}
        <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-6 py-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/20">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-white">
                    {t('aiMatch.aiSmartMatchmaker')}
                  </h2>
                  <span className="rounded-full bg-yellow-400/20 border border-yellow-400/30 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                    Phimium Intelligence
                  </span>
                </div>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  {t('aiMatch.tellYourDesireAndLet')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Thông báo đăng nhập nếu chưa auth */}
          {!user && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs">
              <div className="flex items-center gap-2.5 text-amber-900 font-medium">
                <svg className="h-5 w-5 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>
                  {t('aiMatch.pleaseLogInSoAi')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose()
                  navigate(ROUTES.login)
                }}
                className="shrink-0 rounded-xl bg-blue-950 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-900 transition"
              >
                {t('aiMatch.logIn')}
              </button>
            </div>
          )}

          {searchError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <span className="flex-1">{searchError}</span>
              <div className="flex items-center gap-2 shrink-0">
                {searchError === t('aiMatch.aiEngineNotConfiguredPlease') && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('tags')
                      setSelectedTags(['PHOTOGRAPHY', 'RETRO', 'CHINESE_CUISINE', 'STREET_FOOD', 'CAFE'])
                      setSearchError('')
                    }}
                    className="rounded-xl bg-blue-950 px-3 py-1.5 text-[11px] font-bold text-yellow-300 shadow-sm hover:bg-blue-900 transition"
                  >
                    {t('aiMatch.switchToTagsRetry')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSearchError('')}
                  className="text-rose-400 hover:text-rose-600 font-bold ml-1"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          {/* Form tìm kiếm & thiết lập tiêu chí */}
          {!selectedChoice && (
            <div className="space-y-5">
              {/* Chuyển chế độ: Tự do mô tả (Prompt) vs Chọn Thẻ Tag */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setInputMode('prompt')}
                    className={`rounded-xl px-3.5 py-1.5 transition ${
                      inputMode === 'prompt'
                        ? 'bg-blue-950 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('aiMatch.describeInWords')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputMode('tags')}
                    className={`rounded-xl px-3.5 py-1.5 transition ${
                      inputMode === 'tags'
                        ? 'bg-blue-950 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t('aiMatch.selectTags')}
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {t('aiMatch.poweredByGeminiAi')}
                </span>
              </div>

              {/* Chế độ 1: Prompt Textarea */}
              {inputMode === 'prompt' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('aiMatch.describeYourIdealTourExperience')}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        t('aiMatch.eGIWantAn')
                      }
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-950 transition shadow-inner"
                    />
                  </div>

                  {/* Gợi ý mẫu */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                      {t('aiMatch.orTryQuickPrompts')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((qp, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setMessage(t(`aiMatch.quickPrompts.${qp}.prompt`))}
                          className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-950 transition text-left"
                        >
                          + {t(`aiMatch.quickPrompts.${qp}.label`)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Chế độ 2 hoặc bổ sung: Tags */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    {inputMode === 'prompt'
                      ? t('aiMatch.optionalPreferredTags')
                      : t('aiMatch.selectYourPreferredTourTags')}
                  </label>
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className="text-[11px] text-rose-500 hover:underline font-semibold"
                    >
                      {t('aiMatch.clearAll')}
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-100 rounded-2xl bg-slate-50/50">
                  {catalogTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag.code)
                    return (
                      <button
                        key={tag.code}
                        type="button"
                        onClick={() => toggleTag(tag.code)}
                        className={`rounded-xl px-2.5 py-1 text-[11px] font-semibold transition ${
                          isSelected
                            ? 'bg-amber-400 text-blue-950 font-bold shadow-sm'
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

              {/* Các tiêu chí lọc về Thời gian & Nhóm khách */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                {/* Ngày đi */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.tourDate')}
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs"
                  />
                </div>

                {/* Giờ khởi hành */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.earliestStart')}
                  </label>
                  <input
                    type="time"
                    value={earliestStartTime}
                    onChange={(e) => setEarliestStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs"
                  />
                </div>

                {/* Số người lớn */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.adults1')}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={adultCount}
                    onChange={(e) => setAdultCount(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs"
                  />
                </div>

                {/* Trẻ em */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.children')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={childCount}
                    onChange={(e) => setChildCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs"
                  />
                </div>
              </div>

              {/* Tùy chọn nâng cao: Phong cách Buddy & Ngân sách */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.guidingStyle')}
                  </label>
                  <select
                    value={guidingStyle}
                    onChange={(e) => setGuidingStyle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs bg-white"
                  >
                    <option value="">{t('aiMatch.anyStyle')}</option>
                    <option value="PHOTOGRAPHY_FOCUSED">
                      {t('aiMatch.photographyFocused')}
                    </option>
                    <option value="INFORMATIVE">
                      {t('aiMatch.informative')}
                    </option>
                    <option value="ENGAGING">
                      {t('aiMatch.engagingVibrant')}
                    </option>
                    <option value="CALM">
                      {t('aiMatch.calmThoughtful')}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.language')}
                  </label>
                  <select
                    value={requiredLanguage}
                    onChange={(e) => setRequiredLanguage(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs bg-white"
                  >
                    <option value="VI">Tiếng Việt</option>
                    <option value="EN">English</option>
                    <option value="ZH">中文 (Chinese)</option>
                    <option value="JA">日本語 (Japanese)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.maxBudgetVnd')}
                  </label>
                  <input
                    type="number"
                    step="50000"
                    placeholder={t('aiMatch.eG1000000')}
                    value={maxTotalBudget}
                    onChange={(e) => setMaxTotalBudget(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs"
                  />
                </div>
              </div>

              {/* Nút hành động tìm kiếm */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isSearching}
                  onClick={handleSearch}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-950 py-3.5 text-xs font-black text-yellow-400 shadow-xl hover:from-blue-900 hover:to-indigo-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSearching ? (
                    <>
                      <div className="h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      <span>{t('aiMatch.aiIsAnalyzingMatching')}</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <span>{t('aiMatch.findMatchToursWithAi')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* HIỂN THỊ KẾT QUẢ TÌM KIẾM AI */}
          {matchResult && !selectedChoice && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-blue-950">
                    {t('aiMatch.aiMatchResults')}
                  </span>
                  {matchResult.status === 'MATCHED' && (
                    <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                      {matchResult.choices?.length || 0} {t('aiMatch.choices')}
                    </span>
                  )}
                  {matchResult.engine && (
                    <span className="text-[10px] text-slate-400">
                      (Engine: {matchResult.engine})
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setMatchResult(null)}
                  className="text-xs font-bold text-blue-950 hover:underline"
                >
                  {t('aiMatch.changeCriteria')}
                </button>
              </div>

              {/* Status: NO_MATCHES */}
              {matchResult.status === 'NO_MATCHES' && (
                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/60 p-8 text-center space-y-3">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-sm text-slate-800">
                    {t('aiMatch.noMatchesFound')}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {matchResult.summary || t('aiMatch.allTourSlotsMayBe')}
                  </p>

                  {Array.isArray(matchResult.reasons) && matchResult.reasons.some((reason) => reason.message && reason.message !== matchResult.summary) && (
                    <ul className="mx-auto max-w-md space-y-1 text-left text-xs text-slate-600">
                      {matchResult.reasons.filter((reason) => reason.message && reason.message !== matchResult.summary).map((reason) => (
                        <li key={`${reason.code}:${reason.field}`}>{reason.message}</li>
                      ))}
                    </ul>
                  )}

                  {matchResult.criteria && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 max-w-md mx-auto text-left text-xs bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700">
                        {t('aiMatch.aiExtractedCriteria')}
                      </p>
                      {Array.isArray(matchResult.criteria.tags) && matchResult.criteria.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-semibold">Tags:</span>
                          {matchResult.criteria.tags.map((t) => (
                            <span key={t} className="rounded-md bg-blue-50 text-blue-900 px-1.5 py-0.5 text-[10px] font-bold">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                      {Array.isArray(matchResult.criteria.requiredExperiences) && matchResult.criteria.requiredExperiences.length > 0 && (
                        <p className="text-[11px] text-slate-600">
                          <span className="font-semibold text-slate-400">{t('aiMatch.requiredExperiences')}</span>{' '}
                          {matchResult.criteria.requiredExperiences.map((experience) => experience.description).filter(Boolean).join(', ')}
                        </p>
                      )}
                      {matchResult.criteria.region && (
                        <p className="text-[11px] text-slate-600">
                          <span className="text-slate-400 font-semibold">{t('aiMatch.region')}</span> {matchResult.criteria.region}
                        </p>
                      )}
                      {(matchResult.criteria.earliestStartTime || matchResult.criteria.latestEndTime) && (
                        <p className="text-[11px] text-slate-600">
                          <span className="text-slate-400 font-semibold">{t('aiMatch.timeWindow')}</span>{' '}
                          {matchResult.criteria.earliestStartTime?.slice(0, 5) || t('aiMatch.anyTime')} - {matchResult.criteria.latestEndTime?.slice(0, 5) || t('aiMatch.noLimit')}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Status: NEEDS_DETAILS */}
              {matchResult.status === 'NEEDS_DETAILS' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs space-y-2">
                  <p className="font-bold text-amber-900">
                    {t('aiMatch.needsMoreDetails')}
                  </p>
                  <p className="text-amber-800">
                    {Array.isArray(matchResult.reasons) && matchResult.reasons.length > 0
                      ? matchResult.reasons.map((reason) => reason.message).filter(Boolean).join(' ')
                      : t('aiMatch.pleaseProvide', {
                          fields: matchResult.missingFields?.join(', ') || t('aiMatch.dateOrPreferences'),
                        })}
                  </p>
                </div>
              )}

              {/* Danh sách các lựa chọn (choices) */}
              {Array.isArray(matchResult.choices) && matchResult.choices.length > 0 && (
                <div className="space-y-4">
                  {matchResult.choices.map((choice, idx) => {
                    const act = choice.activity || {}
                    const dep = choice.departure || {}
                    const buddies = choice.buddies || []

                    return (
                      <div
                        key={choice.matchResultId || idx}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition space-y-4 hover:border-blue-950/40"
                      >
                        {/* Header của Choice: Thứ hạng & Tour */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-yellow-400 text-blue-950 font-black text-xs shrink-0 shadow-xs">
                              #{idx + 1}
                            </span>
                            <div>
                              <h4 className="text-sm font-black text-blue-950">
                                {act.title || (t('aiMatch.tour'))}
                              </h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {formatDDMMYYYY(dep.departureDate)} • {dep.startTime?.slice(0, 5)} - {dep.endTime?.slice(0, 5)}
                              </p>
                            </div>
                          </div>

                          <div className="text-right sm:shrink-0">
                            <span className="text-base font-black text-blue-950">
                              {formatMoney(choice.totalAmount)}
                            </span>
                            <p className="text-[10px] text-slate-400 font-medium">
                              {t('aiMatch.totalPackagePrice')}
                            </p>
                          </div>
                        </div>

                        {/* Đội Buddy được ghép */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            {t('aiMatch.aiMatchedBuddyTeam')}
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {buddies.map((b) => (
                              <div key={b.buddyId} className="flex items-center gap-2.5 bg-white rounded-xl p-2 border border-slate-100 shadow-2xs">
                                <div className="h-9 w-9 rounded-full bg-blue-950 text-yellow-300 font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                                  {b.avatarUrl ? (
                                    <img src={b.avatarUrl} alt={b.fullName} className="h-full w-full object-cover" />
                                  ) : (
                                    b.fullName?.[0] || 'B'
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {b.fullName}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                    <span>★ {b.averageRating?.toFixed(1) || '5.0'}</span>
                                    <span>•</span>
                                    <span className="text-blue-900 font-semibold">
                                      {GUIDING_STYLES.includes(b.guidingStyle) ? t(`aiMatch.styles.${b.guidingStyle}`) : b.guidingStyle || 'Buddy'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Lý do AI gợi ý */}
                        {Array.isArray(choice.reasons) && choice.reasons.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-600">
                              {t('aiMatch.whyIsThisTheBest')}
                            </p>
                            <ul className="space-y-1 text-xs text-slate-700">
                              {choice.reasons.map((r, rIdx) => (
                                <li key={rIdx} className="flex items-start gap-2">
                                  <span className="text-emerald-600 font-bold">✓</span>
                                  <span>{r}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Thẻ tag trùng khớp */}
                        {Array.isArray(choice.matchedTags) && choice.matchedTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] text-slate-400 mr-1 font-bold">
                              {t('aiMatch.matchingTags')}
                            </span>
                            {choice.matchedTags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Nút hành động */}
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleStartBooking(choice)}
                            className="rounded-xl bg-blue-950 px-5 py-2 text-xs font-bold text-yellow-400 shadow-md hover:bg-blue-900 transition flex items-center gap-1.5"
                          >
                            <span>{t('aiMatch.bookWithThisTeam')}</span>
                            <span>→</span>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* BƯỚC XÁC NHẬN ĐẶT TOUR TỪ KẾT QUẢ AI */}
          {selectedChoice && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <button
                  type="button"
                  onClick={() => setSelectedChoice(null)}
                  className="text-xs font-bold text-blue-950 hover:underline flex items-center gap-1"
                >
                  <span>←</span>
                  <span>{t('aiMatch.backToAiResults')}</span>
                </button>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-[11px] font-bold text-blue-950">
                  {t('aiMatch.confirmHoldBooking')}
                </span>
              </div>

              {bookingError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                  {bookingError}
                </div>
              )}

              {/* Tóm tắt ca tour & Đội Buddy */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-black text-blue-950">
                      {selectedChoice.activity?.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatDDMMYYYY(selectedChoice.departure?.departureDate)} • {selectedChoice.departure?.startTime?.slice(0, 5)} - {selectedChoice.departure?.endTime?.slice(0, 5)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-black text-blue-950">
                      {formatMoney(selectedChoice.totalAmount)}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {adultCount} {t('aiMatch.adults')}{childCount > 0 ? `, ${childCount} ${t('aiMatch.children2')}` : ''}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">
                    {t('aiMatch.assignedBuddies')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedChoice.buddies?.map((b) => (
                      <span key={b.buddyId} className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold text-slate-800 shadow-2xs">
                        <span>{b.fullName}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form nhập thông tin đón */}
              <form onSubmit={handleConfirmBooking} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('aiMatch.pickupLocation')}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={500}
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder={t('aiMatch.eG19LamSon')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-950 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {t('aiMatch.buddyWillMeetAndPick')}
                  </p>
                </div>

                {/* Điều khoản an toàn */}
                <div className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSafetyAccepted}
                      onChange={(e) => setIsSafetyAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-950 focus:ring-blue-950 cursor-pointer"
                    />
                    <span className="text-slate-700 font-medium leading-relaxed text-xs">
                      {t('aiMatch.safetyAccept.before')}{' '}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowSafetyPolicyModal(true)
                        }}
                        className="text-blue-900 font-bold underline hover:text-blue-700 transition"
                      >
                        {t('aiMatch.safetyAccept.link')}
                      </button>
                      {t('aiMatch.safetyAccept.after')}
                    </span>
                  </label>

                  <div className="pl-6.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowSafetyPolicyModal(true)}
                      className="text-[11px] font-bold text-blue-950 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <span>{t('aiMatch.viewFullSafetyPoliciesGuidelines')}</span>
                      <span>→</span>
                    </button>
                    {isSafetyAccepted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {t('aiMatch.accepted')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nút thanh toán */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isBooking}
                    className="w-full rounded-2xl bg-blue-950 py-3.5 text-xs font-black text-yellow-400 shadow-xl hover:bg-blue-900 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isBooking ? (
                      <>
                        <div className="h-4 w-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                        <span>{t('aiMatch.holdingBooking')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('aiMatch.confirmProceedToPayment')}</span>
                        <span>({formatMoney(selectedChoice.totalAmount)})</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Modal Popup: Đọc Toàn Văn Chính Sách An Toàn */}
      {showSafetyPolicyModal && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSafetyPolicyModal(false)
          }}
          className="fixed inset-0 z-[100001] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
              <div>
                <h3 className="text-base font-black text-white">
                  {t('aiMatch.safetyPoliciesParticipationTerms')}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {t('aiMatch.rulesEnsuringSafetyAndProtection')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSafetyPolicyModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Nội dung chính sách */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs text-slate-700 leading-relaxed">
              <div className="rounded-2xl bg-blue-50 border border-blue-100 p-3.5 text-blue-900">
                <p className="font-bold">
                  {t('aiMatch.phimiumSafetyCommitment')}
                </p>
                <p className="mt-1 text-[11px] text-blue-800">
                  {t('aiMatch.allPhimiumBuddiesAreVerified')}
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {t('aiMatch.1PersonalPrivacy')}
                  </h5>
                  <p className="text-slate-600">
                    {t('aiMatch.neverShareSensitivePersonalInformation')}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {t('aiMatch.2RespectPersonalBoundaries')}
                  </h5>
                  <p className="text-slate-600">
                    {t('aiMatch.respectPersonalSpaceCulturalDifferences')}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {t('aiMatch.3ReportHarassmentInappropriateBehavior')}
                  </h5>
                  <p className="text-slate-600">
                    {t('aiMatch.reportImmediatelyToYourBuddy')}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {t('aiMatch.4FollowBuddyGuidance')}
                  </h5>
                  <p className="text-slate-600">
                    {t('aiMatch.strictlyFollowYourBuddyS')}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {t('aiMatch.5PlatformResponsibilityBoundaries')}
                  </h5>
                  <p className="text-slate-600">
                    {t('aiMatch.phimiumDoesNotSupportAnd')}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowSafetyPolicyModal(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-white transition"
              >
                {t('aiMatch.close')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSafetyAccepted(true)
                  setShowSafetyPolicyModal(false)
                }}
                className="rounded-xl bg-blue-950 px-5 py-2 text-xs font-bold text-yellow-400 hover:bg-blue-900 shadow-md transition"
              >
                {t('aiMatch.iAgreeAcceptTerms')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
