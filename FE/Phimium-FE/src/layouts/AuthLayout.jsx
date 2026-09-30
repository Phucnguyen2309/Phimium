import { Link } from 'react-router-dom'

import authBackground from '@/assets/images/background.jpg'
import { AmbientBackground, LanguageSwitcher } from '@/components/common'
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

  const fadeUp = (delay) => ({ animationDelay: `${delay}ms` })

  return (
    <div className="flex min-h-screen bg-white">
      <aside className="relative isolate hidden w-[46%] flex-col justify-between overflow-hidden bg-blue-950 p-12 text-white lg:flex">
        <img
          src={authBackground}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 -z-20 h-full w-full animate-ken-burns object-cover opacity-25"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-950/80 via-blue-900/85 to-blue-950" />
        <AmbientBackground particles={10} />

        <BrandLogo tone="light" className="relative animate-fade-up" />

        <div className="relative max-w-md">
          <span
            style={fadeUp(100)}
            className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-300"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-400" />
            </span>
            {t('home.hero.eyebrow')}
          </span>

          <h2
            style={fadeUp(200)}
            className="mt-6 animate-fade-up font-display text-4xl font-bold leading-tight xl:text-5xl"
          >
            <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-x">
              {sideTitle}
            </span>
          </h2>
          <p style={fadeUp(300)} className="mt-4 animate-fade-up text-base leading-7 text-blue-100">
            {sideText}
          </p>

          <ul className="mt-8 space-y-3">
            {BENEFITS.map((id, index) => (
              <li key={id} style={fadeUp(420 + index * 120)} className="animate-fade-up">
                <div className="shine group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur transition duration-300 hover:translate-x-1 hover:border-yellow-400/40 hover:bg-white/10">
                  <span
                    style={{ animationDelay: `${index * 0.5}s` }}
                    className="flex h-8 w-8 shrink-0 animate-bob items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-blue-950 shadow-[0_0_18px_rgba(253,199,0,0.45)]"
                  >
                    ✓
                  </span>
                  <span className="text-sm font-semibold">{t(`auth.benefits.${id}`)}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-blue-200">
          © 2026 {APP_NAME}. {t('auth.tagline')}
        </p>
      </aside>

      <main className="relative isolate flex flex-1 flex-col overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -right-24 -top-24 h-80 w-80 animate-drift rounded-full bg-yellow-200/40 blur-[90px]" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 animate-drift-reverse rounded-full bg-blue-200/40 blur-[110px]" />
        </div>

        <div className="flex items-center justify-between gap-4 px-6 py-5 sm:px-10">
          <Link
            to={ROUTES.home}
            className="group inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-blue-950"
          >
            <span aria-hidden="true" className="transition duration-300 group-hover:-translate-x-1">
              ←
            </span>
            {t('auth.backHome')}
          </Link>

          <LanguageSwitcher variant="plain" />
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
          <div className="w-full max-w-md">
            <BrandLogo className="mb-10 animate-fade-up lg:hidden" />

            <h1
              style={fadeUp(80)}
              className="animate-fade-up font-display text-4xl font-bold tracking-tight text-blue-950"
            >
              {title}
            </h1>
            <p style={fadeUp(160)} className="mt-2 animate-fade-up text-sm text-slate-500">
              {subtitle}
            </p>
            <span
              aria-hidden="true"
              style={fadeUp(220)}
              className="mt-5 block h-1 w-14 animate-fade-up rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 bg-[length:200%_auto]"
            />

            <div style={fadeUp(260)} className="mt-8 animate-fade-up">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
