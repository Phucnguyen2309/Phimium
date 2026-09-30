import { Link } from 'react-router-dom'

import logo from '@/assets/images/logo.png'
import { APP_NAME } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

/**
 * Logo Phimium: ảnh logo (src/assets/images/logo.png) + tên + tagline.
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
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
          isLight
            ? 'bg-white shadow-sm ring-1 ring-white/30'
            : 'group-hover:scale-105'
        }`}
      >
        <img src={logo} alt="" aria-hidden="true" className="h-9 w-9 object-contain" />
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
