import { Container, Icon, Reveal } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

import { SectionHeading } from './SectionHeading.jsx'

const PILLARS = [
  { id: 'buddy', number: '01', icon: 'user-group', facts: ['host', 'profile'] },
  { id: 'curated', number: '02', icon: 'sparkles', facts: ['filter', 'info'] },
  { id: 'safety', number: '03', icon: 'shield-check', facts: ['beforeJoin', 'price'] },
]

export function PillarsSection() {
  const { t } = useLanguage()

  return (
    <section id="home-pillars" className="relative bg-white py-24 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={t('home.pillars.eyebrow')}
            title={t('home.pillars.title')}
            subtitle={t('home.pillars.subtitle')}
          />
        </Reveal>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar, index) => (
            <Reveal
              key={pillar.id}
              as="article"
              delay={index * 120}
              className="shine group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-500 ease-out hover:-translate-y-1.5 hover:border-blue-900/20 hover:shadow-[0_30px_60px_-30px_rgba(22,36,86,0.35)]"
            >
              <span className="pointer-events-none absolute right-6 top-5 font-display text-6xl font-bold leading-none text-slate-100 transition duration-500 group-hover:-translate-y-1 group-hover:text-yellow-100">
                {pillar.number}
              </span>

              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-950 text-yellow-400 shadow-lg shadow-blue-950/20 transition duration-500 group-hover:-translate-y-1 group-hover:rotate-[-8deg] group-hover:scale-110">
                <Icon name={pillar.icon} className="h-6 w-6" />
              </span>

              <p className="relative mt-7 text-[11px] font-bold uppercase tracking-[0.22em] text-yellow-600">
                {t('home.pillars.tag', { number: pillar.number })}
              </p>
              <h3 className="relative mt-2 font-display text-2xl font-bold text-blue-950">
                {t(`home.pillars.${pillar.id}.title`)}
              </h3>
              <p className="relative mt-3 flex-1 text-sm leading-7 text-slate-600">
                {t(`home.pillars.${pillar.id}.text`)}
              </p>

              <dl className="relative mt-8 divide-y divide-slate-100 border-t border-slate-100 text-xs">
                {pillar.facts.map((fact) => (
                  <div key={fact} className="flex justify-between gap-3 py-3">
                    <dt className="text-slate-500">
                      {t(`home.pillars.${pillar.id}.facts.${fact}.label`)}
                    </dt>
                    <dd className="text-right font-semibold text-blue-950">
                      {t(`home.pillars.${pillar.id}.facts.${fact}.value`)}
                    </dd>
                  </div>
                ))}
              </dl>

              <span className="absolute inset-x-8 bottom-0 h-0.5 origin-left scale-x-0 bg-yellow-400 transition duration-500 group-hover:scale-x-100" />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  )
}
