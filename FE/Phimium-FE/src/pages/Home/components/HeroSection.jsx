import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import heroBackground from '@/assets/images/background.jpg'
import { AmbientBackground, Container, Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { useParallax } from '@/hooks/useParallax.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'
import { ALL_TYPES } from '@/pages/Home/homeMapper.js'
import { buildActivitiesSearchPath } from '@/routes/paths.js'

const COMMITMENTS = [
  { id: 'localBuddy', icon: 'user' },
  { id: 'safetyTerms', icon: 'shield-check' },
  { id: 'smallGroups', icon: 'user-group' },
  { id: 'clearPricing', icon: 'banknotes' },
]

// Hiệu ứng xuất hiện lần lượt cho các phần của hero
const fadeUp = (delay) => ({ animationDelay: `${delay}ms` })

function SearchField({ label, icon, children }) {
  return (
    <label className="group flex min-w-0 flex-1 cursor-text items-center gap-3 rounded-xl px-4 py-2.5 text-left transition hover:bg-slate-50 focus-within:bg-slate-50">
      <span className="text-slate-400 transition group-focus-within:text-blue-900">
        <Icon name={icon} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
          {label}
        </span>
        {children}
      </span>
    </label>
  )
}

export function HeroSection({ activityTypes = [ALL_TYPES] }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState(ALL_TYPES)
  const backgroundRef = useParallax(0.3)
  const contentRef = useParallax(0.12)

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate(buildActivitiesSearchPath({ keyword, type }))
  }

  return (
    <section className="relative isolate overflow-hidden bg-blue-950 text-white">
      <div ref={backgroundRef} className="absolute inset-0 -z-20 will-change-transform">
        <img
          src={heroBackground}
          alt=""
          aria-hidden="true"
          className="h-full w-full animate-ken-burns object-cover opacity-30"
        />
      </div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-950/80 via-blue-950/85 to-blue-950" />
      <AmbientBackground />

      <Container className="relative flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center py-20 text-center sm:py-24">
        <div ref={contentRef} className="flex w-full flex-col items-center will-change-transform">
          <span
            style={fadeUp(0)}
            className="inline-flex animate-fade-up items-center gap-3 rounded-full border border-yellow-400/30 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-yellow-300 backdrop-blur"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-400" />
            </span>
            {t('home.hero.eyebrow')}
          </span>

          <h1
            style={fadeUp(120)}
            className="mx-auto mt-8 max-w-4xl animate-fade-up font-display text-[2.6rem] font-bold leading-[1.08] tracking-tight sm:text-6xl lg:text-7xl"
          >
            {t('home.hero.titleStart')}{' '}
            <span className="relative whitespace-nowrap bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-200 bg-[length:200%_auto] bg-clip-text italic text-transparent animate-gradient-x">
              {t('home.hero.titleHighlight')}
              <svg
                viewBox="0 0 300 12"
                className="absolute -bottom-2 left-0 h-3 w-full text-yellow-400/80"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M2 9c60-6 140-8 296-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="320"
                  className="animate-draw-loop"
                />
              </svg>
            </span>
          </h1>

          <p
            style={fadeUp(240)}
            className="mx-auto mt-8 max-w-3xl animate-fade-up text-[15px] leading-8 text-blue-100/90 sm:text-[17px]"
          >
            {t('home.hero.subtitle')}
          </p>

          <div style={fadeUp(360)} className="mx-auto mt-12 w-full max-w-3xl animate-fade-up">
            <form
              onSubmit={handleSubmit}
              className="flex w-full animate-glow-pulse flex-col gap-1 rounded-2xl bg-white p-2 text-slate-900 ring-1 ring-white/20 sm:flex-row sm:items-center"
            >
              <SearchField label={t('home.hero.keywordLabel')} icon="magnifying-glass">
                <input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder={t('home.hero.keywordPlaceholder')}
                  className="w-full bg-transparent text-sm font-semibold text-blue-950 outline-none placeholder:font-normal placeholder:text-slate-400"
                />
              </SearchField>

              <div className="mx-1 hidden h-10 w-px bg-slate-200 sm:block" />

              <SearchField label={t('home.hero.typeLabel')} icon="rectangle-stack">
                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full cursor-pointer bg-transparent text-sm font-semibold text-blue-950 outline-none"
                >
                  {activityTypes.map((item) => (
                    <option key={item} value={item}>
                      {item === ALL_TYPES ? t('home.hero.allTypes') : formatActivityType(item)}
                    </option>
                  ))}
                </select>
              </SearchField>

              <button
                type="submit"
                className="shine group inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-7 py-4 text-sm font-bold text-blue-950 shadow-[0_10px_30px_-10px_rgba(253,199,0,0.8)] transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400/40 active:translate-y-0"
              >
                {t('home.hero.search')}
                <Icon
                  name="arrow-right"
                  className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </button>
            </form>
          </div>

          <ul
            style={fadeUp(480)}
            className="mx-auto mt-10 grid w-full max-w-4xl animate-fade-up grid-cols-2 gap-3 lg:grid-cols-4"
          >
            {COMMITMENTS.map((item, index) => (
              <li
                key={item.id}
                className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-left backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-yellow-400/40 hover:bg-white/[0.08]"
              >
                <span
                  style={{ animationDelay: `${index * 0.5}s` }}
                  className="flex h-10 w-10 shrink-0 animate-bob items-center justify-center rounded-full border border-yellow-400/50 text-yellow-400 transition-colors duration-300 group-hover:bg-yellow-400 group-hover:text-blue-950"
                >
                  <Icon name={item.icon} className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    {t(`home.commitments.${item.id}.title`)}
                  </p>
                  <p className="mt-0.5 hidden text-[11px] leading-4 text-blue-200/80 sm:block">
                    {t(`home.commitments.${item.id}.text`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href="#home-pillars"
            aria-label={t('home.hero.scrollHint')}
            className="mt-14 hidden flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-blue-200/70 transition hover:text-yellow-300 sm:flex"
          >
            {t('home.hero.scrollHint')}
            <span className="flex h-9 w-6 justify-center rounded-full border border-current pt-1.5">
              <span className="h-2 w-0.5 animate-float-slow rounded-full bg-current" />
            </span>
          </a>
        </div>
      </Container>
    </section>
  )
}
