import { Container, Reveal, UserAvatar } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'

import { SectionHeading } from './SectionHeading.jsx'

export function BuddiesSection({ buddies = [] }) {
  const { t } = useLanguage()

  if (buddies.length === 0) return null

  return (
    <section className="bg-slate-50 py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('home.buddies.eyebrow')}
            title={t('home.buddies.title')}
            subtitle={t('home.buddies.subtitle')}
          />
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {buddies.map((buddy, index) => (
            <Reveal
              as="article"
              key={buddy.id}
              delay={index * 120}
              className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_30px_60px_-30px_rgba(22,36,86,0.35)]"
            >
              <div className="relative mx-auto h-[5.5rem] w-[5.5rem]">
                <span className="absolute inset-0 animate-spin-slow rounded-full bg-[conic-gradient(from_0deg,#fdc700,transparent_40%,#1c398e,transparent_80%,#fdc700)] opacity-70 transition duration-500 group-hover:opacity-100" />
                <span className="absolute inset-[3px] rounded-full bg-white" />
                <div className="absolute inset-[6px] transition duration-500 group-hover:scale-105">
                  <UserAvatar
                    name={buddy.name}
                    className="h-full w-full text-2xl"
                    colorClassName="bg-blue-950 text-yellow-400"
                  />
                </div>
              </div>

              <h3 className="mt-5 font-display text-xl font-bold text-blue-950">
                {buddy.name}
              </h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {t('home.buddies.activityCount', { count: buddy.activityTitles.length })}
              </p>

              {buddy.activityTypes.length > 0 && (
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {buddy.activityTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full border border-yellow-400/60 bg-yellow-50 px-3 py-1 text-[11px] font-semibold text-yellow-800"
                    >
                      {formatActivityType(type)}
                    </span>
                  ))}
                </div>
              )}

              <ul className="mt-6 space-y-2 border-t border-slate-100 pt-5 text-left text-sm text-slate-600">
                {buddy.activityTitles.slice(0, 3).map((title) => (
                  <li key={title} className="flex items-center gap-2.5">
                    <span className="h-1 w-3 shrink-0 rounded-full bg-yellow-400" aria-hidden="true" />
                    <span className="line-clamp-1">{title}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
