import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import heroBackground from '@/assets/images/background.jpg'
import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'
import { ALL_TYPES } from '@/pages/Home/homeMapper.js'
import { buildActivitiesSearchPath } from '@/routes/paths.js'

const COMMITMENTS = [
  { id: 'localBuddy', icon: '✓' },
  { id: 'safetyTerms', icon: '☂' },
  { id: 'smallGroups', icon: '👥' },
  { id: 'clearPricing', icon: '₫' },
]

function SearchField({ label, children }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 px-4 py-2 text-left">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {children}
    </label>
  )
}

export function HeroSection({ activityTypes = [ALL_TYPES] }) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState(ALL_TYPES)

  const handleSubmit = (event) => {
    event.preventDefault()
    navigate(buildActivitiesSearchPath({ keyword, type }))
  }

  return (
    <section className="relative overflow-hidden bg-blue-950 text-white">
      <img
        src={heroBackground}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-15"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-900/80 to-blue-950" />

      <Container className="relative z-10 py-20 text-center sm:py-24">
        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-400/40 bg-yellow-400/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-yellow-300">
          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
          {t('home.hero.eyebrow')}
        </span>

        <h1 className="mx-auto mt-6 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
          {t('home.hero.titleStart')}{' '}
          <span className="text-yellow-400">{t('home.hero.titleHighlight')}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-blue-100">
          {t('home.hero.subtitle')}
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-10 flex max-w-3xl flex-col gap-2 rounded-2xl bg-white p-2 text-slate-900 shadow-[0_24px_60px_rgba(2,6,23,0.45)] sm:flex-row sm:items-center"
        >
          <SearchField label={t('home.hero.keywordLabel')}>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder={t('home.hero.keywordPlaceholder')}
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-slate-400"
            />
          </SearchField>

          <div className="hidden h-10 w-px bg-slate-200 sm:block" />

          <SearchField label={t('home.hero.typeLabel')}>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
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
            className="rounded-xl bg-yellow-400 px-8 py-4 text-sm font-black text-blue-950 transition hover:bg-yellow-300"
          >
            {t('home.hero.search')}
          </button>
        </form>

        <div className="mx-auto mt-8 grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
          {COMMITMENTS.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left backdrop-blur"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-400 text-sm font-black text-blue-950">
                {item.icon}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">
                  {t(`home.commitments.${item.id}.title`)}
                </p>
                <p className="text-[11px] leading-4 text-blue-200">
                  {t(`home.commitments.${item.id}.text`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
