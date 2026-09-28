import { Link } from 'react-router-dom'

import { APP_NAME } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

/**
 * Logo Phimium: biểu tượng chữ P + tên + tagline.
 * tone="dark": chữ navy trên nền sáng (mặc định) | tone="light": chữ trắng trên nền tối.
 */
export function BrandLogo({ className = '', tone = 'dark' }) {
  const { t } = useLanguage()
  const isLight = tone === 'light'

  return (
    <Link
      to={ROUTES.home}
      aria-label={APP_NAME}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm transition ${
          isLight
            ? 'bg-white/10 ring-1 ring-white/20 group-hover:bg-white/20'
            : 'bg-blue-950 group-hover:bg-blue-900'
        }`}
      >
        <svg viewBox="0 0 32 32" className="h-6 w-6" aria-hidden="true">
          <path
            d="M10 26V7h8.2c4.3 0 7 2.4 7 6.1s-2.7 6.2-7 6.2H14.6"
            fill="none"
            stroke="white"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="19" cy="13.1" r="2.3" fill="#facc15" />
        </svg>
      </span>

      <span className="flex flex-col leading-none">
        <span
          className={`text-lg font-black tracking-wide ${
            isLight ? 'text-white' : 'text-blue-950'
          }`}
        >
          {APP_NAME.toUpperCase()}
        </span>
        <span
          className={`mt-1 hidden text-[10px] font-semibold uppercase tracking-[0.14em] sm:block ${
            isLight ? 'text-blue-200' : 'text-slate-500'
          }`}
        >
          {t('brand.tagline')}
        </span>
      </span>
    </Link>
  )
}
