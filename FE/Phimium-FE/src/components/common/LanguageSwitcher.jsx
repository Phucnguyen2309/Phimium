import { LANGUAGES } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'

const OPTIONS = [
  { value: LANGUAGES.vi, label: 'VI' },
  { value: LANGUAGES.en, label: 'EN' },
]

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  )
}

/** Nút đổi ngôn ngữ VI / EN. variant="plain": không viền, có icon quả địa cầu (dùng trên header). */
export function LanguageSwitcher({ className = '', variant = 'pill' }) {
  const { language, setLanguage, t } = useLanguage()
  const isPlain = variant === 'plain'

  return (
    <div
      role="group"
      aria-label={t('common.language')}
      className={`inline-flex items-center text-xs font-bold ${
        isPlain
          ? 'gap-1 text-slate-600'
          : 'rounded-full border border-slate-200 bg-white p-0.5'
      } ${className}`}
    >
      {isPlain && <GlobeIcon />}

      {OPTIONS.map((option, index) => {
        const isActive = option.value === language

        return (
          <span key={option.value} className="inline-flex items-center">
            {isPlain && index > 0 && <span className="px-0.5 text-slate-300">|</span>}
            <button
              type="button"
              aria-pressed={isActive}
              onClick={() => setLanguage(option.value)}
              className={`transition ${
                isPlain
                  ? `px-1 py-1 ${isActive ? 'text-blue-950' : 'text-slate-400 hover:text-blue-900'}`
                  : `rounded-full px-2.5 py-1 ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-500 hover:text-slate-900'
                    }`
              }`}
            >
              {option.label}
            </button>
          </span>
        )
      })}
    </div>
  )
}
