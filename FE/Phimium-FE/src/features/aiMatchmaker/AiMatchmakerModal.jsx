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
import { ROUTES } from '@/routes/paths.js'

const QUICK_PROMPTS = [
  {
    labelVi: 'Chụp ảnh retro & ẩm thực Chợ Lớn',
    labelEn: 'Retro photography & Chinatown food',
    prompt: 'Muốn đi dạo chụp ảnh retro, thử các món ăn vặt đường phố người Hoa và ghé quán cà phê cổ.',
  },
  {
    labelVi: 'Tìm hiểu lịch sử & văn hóa Sài Gòn',
    labelEn: 'History & Saigon heritage',
    prompt: 'Muốn khám phá các di tích lịch sử, kiến trúc cổ xưa cùng hướng dẫn viên am hiểu sâu sắc.',
  },
  {
    labelVi: 'Tour cà phê chill buổi chiều',
    labelEn: 'Afternoon chill cafe tour',
    prompt: 'Tìm kiếm không gian cà phê yên tĩnh, hoài niệm, nhịp điệu từ tốn để thư giãn cuối tuần.',
  },
  {
    labelVi: 'Ẩm thực đường phố náo nhiệt',
    labelEn: 'Vibrant street food tour',
    prompt: 'Khám phá các hàng quán ăn ngon nổi tiếng, trải nghiệm không khí náo nhiệt và vui vẻ.',
  },
]

const GUIDING_STYLE_LABELS = {
  PHOTOGRAPHY_FOCUSED: { vi: 'Chuyên chụp ảnh', en: 'Photography' },
  INFORMATIVE: { vi: 'Giàu kiến thức', en: 'Informative' },
  ENGAGING: { vi: 'Năng động & Hoạt náo', en: 'Vibrant' },
  CALM: { vi: 'Điềm đạm & Tận tâm', en: 'Calm' },
}

export function AiMatchmakerModal({ isOpen, onClose }) {
  const { language } = useLanguage()
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
        isVi
          ? 'Vui lòng đăng nhập tài khoản khách hàng để sử dụng AI Matchmaker'
          : 'Please log in to use AI Matchmaker'
      )
      return
    }

    if (inputMode === 'prompt' && !message.trim() && selectedTags.length === 0) {
      setSearchError(
        isVi
          ? 'Vui lòng nhập mong muốn của bạn hoặc chọn các thẻ sở thích'
          : 'Please enter your tour request or choose tags'
      )
      return
    }

    if (inputMode === 'tags' && selectedTags.length === 0) {
      setSearchError(
        isVi ? 'Vui lòng chọn ít nhất 1 thẻ sở thích' : 'Please select at least 1 tag'
      )
      return
    }

    if (!date) {
      setSearchError(isVi ? 'Vui lòng chọn ngày đi tour' : 'Please select a date')
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
        locale: isVi ? 'vi' : 'en',
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
          isVi
            ? 'Hệ thống AI đang bảo trì cấu hình. Bạn hãy thử chọn các thẻ tag trực tiếp nhé!'
            : 'AI engine not configured. Please use tag-based search.'
        )
      } else if (code === 6002) {
        setSearchError(
          isVi
            ? 'Kết nối dịch vụ AI tạm thời gián đoạn. Vui lòng thử lại sau giây lát.'
            : 'AI provider is temporarily unavailable. Please retry.'
        )
      } else {
        setSearchError(getErrorMessage(err, isVi ? 'Không tìm thấy tour phù hợp' : 'Matching failed'))
      }
    } finally {
      setIsSearching(false)
    }
  }

  const handleStartBooking = (choice) => {
    setSelectedChoice(choice)
    setBookingError('')
    setPickupLocation('')
    setIsSafetyAccepted(false)
  }

  const handleConfirmBooking = async (e) => {
    e.preventDefault()
    if (!selectedChoice) return

    if (!pickupLocation.trim()) {
      setBookingError(isVi ? 'Vui lòng nhập địa chỉ đón khách' : 'Pickup location is required')
      return
    }

    if (!isSafetyAccepted) {
      setBookingError(isVi ? 'Vui lòng đồng ý với điều khoản an toàn' : 'Please accept safety terms')
      return
    }

    setIsBooking(true)
    setBookingError('')

    try {
      const payload = {
        matchResultId: selectedChoice.matchResultId,
        departureId: selectedChoice.departure.departureId,
        adultCount: Number(adultCount) || 1,
        childCount: Number(childCount) || 0,
        pickupLocation: pickupLocation.trim(),
        isSafetyTermsAccepted: true,
      }

      const res = await registrationService.create(payload)
      const regData = getResponseData(res)

      // Nếu tour miễn phí hoặc tổng tiền 0 VND
      if (!Number(regData?.totalAmount)) {
        onClose()
        navigate(ROUTES.userDashboard, {
          state: { messageKey: 'activityDetail.booking.bookedFree' },
        })
        return
      }

      // Tạo cổng thanh toán trực tuyến
      try {
        const paymentRes = await paymentService.createPayment(regData.registrationId)
        const payment = getResponseData(paymentRes)
        if (payment?.checkoutUrl) {
          onClose()
          submitCheckoutForm(payment)
          return
        }
      } catch {
        // Chỗ vẫn được giữ an toàn, chuyển về trang cá nhân để thanh toán sau
      }

      onClose()
      navigate(ROUTES.userDashboard, {
        state: { messageKey: 'activityDetail.booking.bookedPayLater' },
      })
    } catch (err) {
      console.error('Lỗi đặt tour từ AI match:', err)
      const code = err?.response?.data?.code
      if (code === 6006) {
        setBookingError(
          isVi
            ? 'Đề xuất AI này đã hết hạn giữ chỗ (10 phút). Vui lòng bấm Tìm kiếm lại.'
            : 'Match result expired. Please search again.'
        )
      } else if (code === 6007) {
        setBookingError(
          isVi
            ? 'Thông tin tour hoặc Buddy đã thay đổi. Vui lòng tìm kiếm lại.'
            : 'Tour or Buddy details changed. Please search again.'
        )
      } else {
        setBookingError(getErrorMessage(err, isVi ? 'Đặt tour thất bại' : 'Booking failed'))
      }
    } finally {
      setIsBooking(false)
    }
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
                    {isVi ? 'AI Smart Matchmaker' : 'AI Smart Matchmaker'}
                  </h2>
                  <span className="rounded-full bg-yellow-400/20 border border-yellow-400/30 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                    Phimium Intelligence
                  </span>
                </div>
                <p className="text-xs text-blue-200/80 mt-0.5">
                  {isVi
                    ? 'Nhập mong muốn hoặc chọn sở thích để AI ghép cặp tour và Buddy lý tưởng nhất cho bạn'
                    : 'Tell your desire and let AI find matching tours and best buddies for you'}
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
                  {isVi
                    ? 'Bạn cần đăng nhập để hệ thống AI kết nối và giữ chỗ với đội Buddy.'
                    : 'Please log in so AI can reserve your tour and matched buddies.'}
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
                {isVi ? 'Đăng nhập ngay' : 'Log In'}
              </button>
            </div>
          )}

          {searchError && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-semibold text-rose-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <span className="flex-1">{searchError}</span>
              <div className="flex items-center gap-2 shrink-0">
                {searchError.includes('thẻ tag') && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('tags')
                      setSelectedTags(['PHOTOGRAPHY', 'RETRO', 'CHINESE_CUISINE', 'STREET_FOOD', 'CAFE'])
                      setSearchError('')
                    }}
                    className="rounded-xl bg-blue-950 px-3 py-1.5 text-[11px] font-bold text-yellow-300 shadow-sm hover:bg-blue-900 transition"
                  >
                    {isVi ? '⚡ Đổi sang Thẻ Tag & Thử lại' : '⚡ Switch to Tags & Retry'}
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
                    {isVi ? 'Mô tả tự do bằng lời' : 'Describe in words'}
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
                    {isVi ? 'Chọn thẻ sở thích (Tags)' : 'Select tags'}
                  </button>
                </div>

                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  {isVi ? 'Phân tích thông minh với Gemini' : 'Powered by Gemini AI'}
                </span>
              </div>

              {/* Chế độ 1: Prompt Textarea */}
              {inputMode === 'prompt' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {isVi ? 'Bạn mong muốn chuyến đi như thế nào? *' : 'Describe your ideal tour experience: *'}
                    </label>
                    <textarea
                      rows={3}
                      maxLength={1000}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={
                        isVi
                          ? 'VD: Mình muốn một chuyến đi dạo buổi chiều ở Chợ Lớn, chụp ảnh phong cách retro, thử các món ăn vặt đường phố và ghé một quán cà phê cổ...'
                          : 'E.g., I want an afternoon walking tour in Chinatown, taking retro photos, tasting local street snacks and visiting a vintage cafe...'
                      }
                      className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-blue-950 transition shadow-inner"
                    />
                  </div>

                  {/* Gợi ý mẫu */}
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-1.5">
                      {isVi ? 'Hoặc chọn nhanh gợi ý trải nghiệm:' : 'Or try quick prompts:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_PROMPTS.map((qp, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setMessage(qp.prompt)}
                          className="rounded-xl border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-950 transition text-left"
                        >
                          + {isVi ? qp.labelVi : qp.labelEn}
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
                      ? isVi
                        ? 'Thẻ sở thích bổ sung (tùy chọn):'
                        : 'Optional preferred tags:'
                      : isVi
                        ? 'Chọn các thẻ sở thích & đặc trưng tour bạn thích: *'
                        : 'Select your preferred tour tags: *'}
                  </label>
                  {selectedTags.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedTags([])}
                      className="text-[11px] text-rose-500 hover:underline font-semibold"
                    >
                      {isVi ? 'Bỏ chọn tất cả' : 'Clear all'}
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
                    {isVi ? 'Ngày đi tour *' : 'Tour Date *'}
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
                    {isVi ? 'Khung giờ bắt đầu' : 'Earliest Start'}
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
                    {isVi ? 'Người lớn (≥ 1)' : 'Adults (≥ 1)'}
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
                    {isVi ? 'Trẻ em' : 'Children'}
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
                    {isVi ? 'Gu Buddy mong muốn' : 'Guiding Style'}
                  </label>
                  <select
                    value={guidingStyle}
                    onChange={(e) => setGuidingStyle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-blue-950 text-xs bg-white"
                  >
                    <option value="">{isVi ? 'Tất cả phong cách' : 'Any Style'}</option>
                    <option value="PHOTOGRAPHY_FOCUSED">
                      {isVi ? 'Chuyên chụp ảnh' : 'Photography Focused'}
                    </option>
                    <option value="INFORMATIVE">
                      {isVi ? 'Giàu kiến thức lịch sử' : 'Informative'}
                    </option>
                    <option value="ENGAGING">
                      {isVi ? 'Năng động & Hoạt náo' : 'Engaging & Vibrant'}
                    </option>
                    <option value="CALM">
                      {isVi ? 'Điềm đạm & Tận tâm' : 'Calm & Thoughtful'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {isVi ? 'Ngôn ngữ hướng dẫn' : 'Language'}
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
                    {isVi ? 'Ngân sách tối đa (VND)' : 'Max Budget (VND)'}
                  </label>
                  <input
                    type="number"
                    step="50000"
                    placeholder={isVi ? 'VD: 1000000' : 'E.g., 1000000'}
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
                      <span>{isVi ? 'AI đang quét và ghép tour tối ưu...' : 'AI is analyzing & matching...'}</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <span>{isVi ? 'Tìm kiếm & Ghép tour bằng AI' : 'Find & Match Tours with AI'}</span>
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
                    {isVi ? 'KẾT QUẢ GỢI Ý TỪ AI' : 'AI MATCH RESULTS'}
                  </span>
                  <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 text-[10px]">
                    {matchResult.choices?.length || 0} {isVi ? 'lựa chọn tối ưu' : 'choices'}
                  </span>
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
                  {isVi ? '← Đổi tiêu chí tìm kiếm' : '← Change criteria'}
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
                    {isVi ? 'Chưa tìm thấy ca tour hoặc Buddy phù hợp' : 'No matches found'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    {isVi
                      ? 'Có thể vào ngày này các ca tour đã kín chỗ, tiêu chí khung giờ hoặc khu vực chưa khớp với thông tin tour đã tạo.'
                      : 'All tour slots may be fully booked or no buddies match on this date. Try another date or adjust your budget.'}
                  </p>

                  {matchResult.criteria && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 max-w-md mx-auto text-left text-xs bg-white rounded-2xl p-3 border border-slate-100 shadow-2xs space-y-1.5">
                      <p className="text-[11px] font-bold text-slate-700">
                        {isVi ? 'Tiêu chí AI đã bóc tách từ lời văn:' : 'AI extracted criteria:'}
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
                      {matchResult.criteria.region && (
                        <p className="text-[11px] text-slate-600">
                          <span className="text-slate-400 font-semibold">{isVi ? 'Khu vực lọc:' : 'Region:'}</span> {matchResult.criteria.region}
                        </p>
                      )}
                      {(matchResult.criteria.earliestStartTime || matchResult.criteria.latestEndTime) && (
                        <p className="text-[11px] text-slate-600">
                          <span className="text-slate-400 font-semibold">{isVi ? 'Khung giờ yêu cầu:' : 'Time window:'}</span>{' '}
                          {matchResult.criteria.earliestStartTime?.slice(0, 5) || 'Bất kỳ'} - {matchResult.criteria.latestEndTime?.slice(0, 5) || 'Không giới hạn'}
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
                    {isVi ? 'Cần thêm thông tin để ghép tour chính xác:' : 'Needs more details:'}
                  </p>
                  <p className="text-amber-800">
                    {isVi
                      ? 'Vui lòng bổ sung: ' + (matchResult.missingFields?.join(', ') || 'ngày đi hoặc sở thích')
                      : 'Please provide: ' + (matchResult.missingFields?.join(', ') || 'date or preferences')}
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
                                {act.title || (isVi ? 'Tour khám phá' : 'Tour')}
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
                              {isVi ? 'Tổng trọn gói cho đoàn' : 'Total package price'}
                            </p>
                          </div>
                        </div>

                        {/* Đội Buddy được ghép */}
                        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            {isVi ? 'Đội Hướng dẫn viên (Buddy) được AI ghép cặp:' : 'AI Matched Buddy Team:'}
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
                                      {GUIDING_STYLE_LABELS[b.guidingStyle]?.[isVi ? 'vi' : 'en'] || b.guidingStyle || 'Buddy'}
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
                              {isVi ? 'Vì sao lựa chọn này hợp với bạn nhất?' : 'Why is this the best match for you?'}
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
                              {isVi ? 'Điểm chung:' : 'Matching tags:'}
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
                            <span>{isVi ? 'Đặt tour ngay với đội này' : 'Book with this Team'}</span>
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
                  <span>{isVi ? 'Quay lại danh sách kết quả AI' : 'Back to AI results'}</span>
                </button>
                <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-[11px] font-bold text-blue-950">
                  {isVi ? 'Xác nhận giữ chỗ & Đặt tour' : 'Confirm & Hold Booking'}
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
                      {adultCount} {isVi ? 'người lớn' : 'adults'}{childCount > 0 ? `, ${childCount} ${isVi ? 'trẻ em' : 'children'}` : ''}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-2 flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-600">
                    {isVi ? 'Buddy phụ trách:' : 'Assigned Buddies:'}
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
                    {isVi ? 'Điểm đón khách (Địa chỉ / Khách sạn) *' : 'Pickup Location *'}
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={500}
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    placeholder={isVi ? 'VD: Khách sạn Caravelle, 19 Công trường Lam Sơn, Bến Nghé, Quận 1' : 'E.g., 19 Lam Son Square, District 1'}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-800 outline-none focus:border-blue-950 transition"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    {isVi ? 'Buddy sẽ liên hệ đón bạn tại địa chỉ này trước giờ tour khởi hành.' : 'Buddy will meet and pick you up at this location.'}
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
                      {isVi ? (
                        <>
                          Tôi xác nhận đã đọc, hiểu và đồng ý tuân thủ{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowSafetyPolicyModal(true)
                            }}
                            className="text-blue-900 font-bold underline hover:text-blue-700 transition"
                          >
                            chính sách an toàn & điều khoản tham gia tour
                          </button>{' '}
                          của Phimium.
                        </>
                      ) : (
                        <>
                          I accept and agree to follow{' '}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setShowSafetyPolicyModal(true)
                            }}
                            className="text-blue-900 font-bold underline hover:text-blue-700 transition"
                          >
                            Phimium safety policies and participation terms
                          </button>.
                        </>
                      )}
                    </span>
                  </label>

                  <div className="pl-6.5 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowSafetyPolicyModal(true)}
                      className="text-[11px] font-bold text-blue-950 hover:text-blue-800 hover:underline flex items-center gap-1"
                    >
                      <span>{isVi ? 'Xem toàn văn chính sách an toàn & quy định du khách' : 'View full safety policies & guidelines'}</span>
                      <span>→</span>
                    </button>
                    {isSafetyAccepted && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {isVi ? '✓ Đã đồng ý' : '✓ Accepted'}
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
                        <span>{isVi ? 'Đang giữ chỗ & Đặt tour...' : 'Holding booking...'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isVi ? 'Xác nhận giữ chỗ & Tiến hành thanh toán' : 'Confirm & Proceed to Payment'}</span>
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
                  {isVi ? 'Chính Sách An Toàn & Điều Khoản Tham Gia Tour' : 'Safety Policies & Participation Terms'}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {isVi ? 'Quy tắc đảm bảo an toàn & quyền lợi du khách tại Phimium' : 'Rules ensuring safety and protection for all participants'}
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
                  {isVi
                    ? 'Cam kết an toàn từ Phimium'
                    : 'Phimium Safety Commitment'}
                </p>
                <p className="mt-1 text-[11px] text-blue-800">
                  {isVi
                    ? 'Tất cả Buddy của Phimium đều đã qua xác minh danh tính và kiểm tra năng lực. Để chuyến đi diễn ra trọn vẹn và an toàn nhất, quý khách vui lòng đọc kỹ các quy định dưới đây:'
                    : 'All Phimium Buddies are verified. Please review the following rules to ensure a safe and delightful experience:'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {isVi ? '1. Bảo mật thông tin cá nhân' : '1. Personal Privacy'}
                  </h5>
                  <p className="text-slate-600">
                    {isVi
                      ? 'Tuyệt đối không chia sẻ thông tin cá nhân nhạy cảm (SĐT, Địa chỉ nhà, tài khoản ngân hàng) ở lần gặp đầu tiên.'
                      : 'Never share sensitive personal information (phone number, home address, bank accounts) during the first meet.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {isVi ? '2. Tôn trọng không gian cá nhân' : '2. Respect Personal Boundaries'}
                  </h5>
                  <p className="text-slate-600">
                    {isVi
                      ? 'Tôn trọng không gian cá nhân và sự khác biệt về văn hóa, quan điểm của Buddy và các thành viên khác trong đoàn.'
                      : 'Respect personal space, cultural differences, and diverse perspectives of your Buddy and tour members.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {isVi ? '3. Báo cáo hành vi thiếu chuẩn mực' : '3. Report Harassment & Inappropriate Behavior'}
                  </h5>
                  <p className="text-slate-600">
                    {isVi
                      ? 'Luôn báo cáo ngay cho Buddy hoặc Admin qua hotline hỗ trợ nếu có bất kỳ hành vi quấy rối, thiếu chuẩn mực hoặc xâm phạm an toàn cá nhân nào.'
                      : 'Report immediately to your Buddy or Admin if you encounter any harassment, inappropriate conduct, or safety concerns.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {isVi ? '4. Tuân thủ sự điều phối của Buddy' : '4. Follow Buddy Guidance'}
                  </h5>
                  <p className="text-slate-600">
                    {isVi
                      ? 'Tuân thủ tuyệt đối sự điều phối của Buddy trong suốt thời gian diễn ra hoạt động để đảm bảo an toàn lộ trình, di chuyển giao thông và thời gian các điểm dừng.'
                      : 'Strictly follow your Buddy’s coordination and instructions throughout the tour to ensure safety and itinerary adherence.'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <h5 className="font-bold text-slate-900 mb-1">
                    {isVi ? '5. Giới hạn trách nhiệm nền tảng' : '5. Platform Responsibility Boundaries'}
                  </h5>
                  <p className="text-slate-600">
                    {isVi
                      ? 'Phimium không hỗ trợ và không chịu trách nhiệm cho các cuộc gặp gỡ, giao dịch hoặc thỏa thuận riêng lẻ 1-1 phát sinh ngoài nền tảng.'
                      : 'Phimium does not support and is not responsible for any private 1-on-1 meetups or transactions outside the platform.'}
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
                {isVi ? 'Đóng' : 'Close'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSafetyAccepted(true)
                  setShowSafetyPolicyModal(false)
                }}
                className="rounded-xl bg-blue-950 px-5 py-2 text-xs font-bold text-yellow-400 hover:bg-blue-900 shadow-md transition"
              >
                {isVi ? 'Tôi đã đọc và Đồng ý với chính sách này' : 'I Agree & Accept Terms'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
