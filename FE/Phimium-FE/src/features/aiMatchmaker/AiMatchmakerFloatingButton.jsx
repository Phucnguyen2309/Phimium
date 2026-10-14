import { useLanguage } from '@/context/languageContext.js'

export function AiMatchmakerFloatingButton({ onClick }) {
  const { language } = useLanguage()
  const isVi = language === 'vi'

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2.5 rounded-full bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 px-4 py-3 text-white shadow-2xl border border-yellow-400/40 hover:scale-105 active:scale-95 transition-all duration-300 backdrop-blur-md"
      style={{
        boxShadow: '0 10px 25px -5px rgba(253, 199, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      }}
      title={isVi ? 'Ghép tour và Hướng dẫn viên bằng AI' : 'Match tour and buddy with AI'}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-400 text-blue-950 font-black shrink-0 animate-pulse">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
        </svg>
      </div>

      <div className="text-left pr-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black text-yellow-300">
            {isVi ? 'AI Matchmaker' : 'AI Matchmaker'}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-ping" />
        </div>
        <p className="text-[10px] text-blue-200/80 font-medium hidden sm:block">
          {isVi ? 'Ghép tour & Buddy hợp gu' : 'Find ideal tour & buddy'}
        </p>
      </div>
    </button>
  )
}
