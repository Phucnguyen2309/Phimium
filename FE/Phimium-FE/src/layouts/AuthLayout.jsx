import { Link } from 'react-router-dom'

import authBackground from '@/assets/images/background.jpg'
import { LanguageSwitcher } from '@/components/common'
import { BrandLogo } from '@/components/layout/BrandLogo.jsx'
import { APP_NAME } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

const BENEFITS = ['localBuddy', 'smallGroups', 'safety']

/**
 * Khung chung cho trang Đăng nhập / Đăng ký:
 * trái là panel thương hiệu (ẩn trên mobile), phải là form.
 */
export function AuthLayout({ title, subtitle, sideTitle, sideText, children }) {
  const { t } = useLanguage()

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative hidden w-[46%] flex-col justify-between overflow-hidden bg-blue-950 p-12 text-white lg:flex">
        <img
          src={authBackground}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/85 to-blue-950" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl" />

        <BrandLogo tone="light" className="relative" />

        <div className="relative max-w-md">
          <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-300">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            {t('home.hero.eyebrow')}
          </span>

          <h2 className="mt-6 text-4xl font-black leading-tight">{sideTitle}</h2>
          <p className="mt-4 text-base leading-7 text-blue-100">{sideText}</p>

          <ul className="mt-8 space-y-3">
            {BENEFITS.map((id) => (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-blue-950">
                  ✓
                </span>
                <span className="text-sm font-semibold">
                  {t(`auth.benefits.${id}`)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-blue-200">
          © 2026 {APP_NAME}. {t('auth.tagline')}
        </p>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <Link
            to={ROUTES.home}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-950"
          >
            <span aria-hidden="true">←</span>
            {t('auth.backHome')}
          </Link>

          <LanguageSwitcher variant="plain" />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
          <div className="w-full max-w-md">
            <BrandLogo className="mb-10 lg:hidden" />

            <h1 className="text-3xl font-black tracking-tight text-blue-950">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-500">{subtitle}</p>

            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>
    </div>
  )
}
