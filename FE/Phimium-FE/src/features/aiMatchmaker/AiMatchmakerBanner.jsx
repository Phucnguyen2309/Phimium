import { useLanguage } from '@/context/languageContext.js'

export function AiMatchmakerBanner({ onOpenModal }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-blue-900/40 my-6">
      {/* Background ambient glow */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 border border-yellow-400/30 px-3 py-1 text-xs font-bold text-yellow-300">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span>{isVi ? 'Tính năng mới: AI Smart Matchmaker' : 'New Feature: AI Smart Matchmaker'}</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
            {isVi
              ? 'Chưa biết chọn tour nào? Hãy để AI ghép cặp Buddy & chuyến đi lý tưởng nhất!'
              : 'Unsure which tour to choose? Let AI match your ideal tour and best Buddy!'}
          </h2>

          <p className="text-xs sm:text-sm text-blue-200/80 leading-relaxed">
            {isVi
              ? 'Chỉ cần nhập sở thích (thích chụp ảnh retro, ăn món người Hoa hay thích chill quán cà phê), AI của Phimium sẽ tự động phân tích và ghép bạn với hướng dẫn viên hợp gu nhất.'
              : 'Simply tell your preferences (retro photography, local street food or peaceful cafe chill), Phimium AI will find your best matching tour and guides.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="text-yellow-400 font-bold">✓</span>
              {isVi ? 'Cá nhân hóa theo gu thẩm mỹ' : 'Personalized to your taste'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-yellow-400 font-bold">✓</span>
              {isVi ? 'Đội Buddy được xếp hạng tự động' : 'Top ranked matching buddies'}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-yellow-400 font-bold">✓</span>
              {isVi ? 'Giữ chỗ và đặt tour tức thì' : 'Instant hold & reservation'}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          <button
            type="button"
            onClick={onOpenModal}
            className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-yellow-400 px-6 py-3.5 text-xs sm:text-sm font-black text-blue-950 shadow-xl transition-all duration-200 hover:bg-yellow-300 hover:scale-105 active:scale-95"
          >
            <svg className="h-4 w-4 text-blue-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <span>{isVi ? 'Thử ngay AI Matchmaker' : 'Try AI Matchmaker'}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </div>
  )
}
