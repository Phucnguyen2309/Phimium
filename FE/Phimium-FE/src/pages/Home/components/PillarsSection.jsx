import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

const PILLARS = [
  { id: 'buddy', number: '01', icon: '🧭', facts: ['host', 'profile'] },
  { id: 'curated', number: '02', icon: '🎨', facts: ['filter', 'info'] },
  { id: 'safety', number: '03', icon: '🛡️', facts: ['beforeJoin', 'price'] },
]

export function PillarsSection() {
  const { t } = useLanguage()

  return (
    <section className="bg-white py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            {t('home.pillars.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
            {t('home.pillars.title')}
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {t('home.pillars.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {PILLARS.map((pillar) => (
            <article
              key={pillar.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                {pillar.icon}
              </span>

              <p className="mt-5 text-[11px] font-bold uppercase tracking-wider text-yellow-600">
                {t('home.pillars.tag', { number: pillar.number })}
              </p>
              <h3 className="mt-1 text-lg font-black text-blue-950">
                {t(`home.pillars.${pillar.id}.title`)}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                {t(`home.pillars.${pillar.id}.text`)}
              </p>

              <dl className="mt-6 space-y-2 rounded-xl bg-slate-50 p-4 text-xs">
                {pillar.facts.map((fact) => (
                  <div key={fact} className="flex justify-between gap-3">
                    <dt className="text-slate-500">
                      {t(`home.pillars.${pillar.id}.facts.${fact}.label`)}
                    </dt>
                    <dd className="text-right font-bold text-blue-900">
                      {t(`home.pillars.${pillar.id}.facts.${fact}.value`)}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
