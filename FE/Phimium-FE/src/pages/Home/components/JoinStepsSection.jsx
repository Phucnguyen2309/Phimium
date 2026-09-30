import { Link } from 'react-router-dom'

import { Container, Icon, Reveal } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

import { SectionHeading } from './SectionHeading.jsx'

const STEPS = [
  { id: 'choose', number: '01', icon: 'magnifying-glass' },
  { id: 'confirm', number: '02', icon: 'shield-check' },
  { id: 'meet', number: '03', icon: 'user-group' },
]

export function JoinStepsSection({ isAuthenticated = false }) {
  const { t } = useLanguage()

  return (
    <section className="relative isolate overflow-hidden bg-blue-950 py-24 text-white sm:py-28">
      <div className="absolute -left-40 top-0 -z-10 h-96 w-96 rounded-full bg-blue-700/30 blur-[120px]" />
      <div className="absolute -right-20 bottom-0 -z-10 h-72 w-72 rounded-full bg-yellow-400/10 blur-[100px]" />
      <div
        className="absolute inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <SectionHeading
              align="left"
              tone="light"
              eyebrow={t('home.steps.eyebrow')}
              title={t('home.steps.title')}
              subtitle={t('home.steps.subtitle')}
            />

            <ol className="relative mt-12 grid gap-5 sm:grid-cols-3">
              <span className="line-grow absolute left-6 right-6 top-6 hidden h-px origin-left bg-gradient-to-r from-yellow-400/80 via-yellow-400/40 to-transparent sm:block" />

              {STEPS.map((item, index) => (
                <Reveal
                  as="li"
                  key={item.id}
                  delay={150 + index * 120}
                  className="group relative"
                >
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-yellow-400/60 bg-blue-950 text-yellow-400 transition duration-300 group-hover:scale-110 group-hover:bg-yellow-400 group-hover:text-blue-950">
                    <span
                      className="absolute inset-0 animate-ping rounded-full border border-yellow-400/40"
                      style={{ animationDuration: '2.4s', animationDelay: `${index * 0.8}s` }}
                    />
                    <Icon name={item.icon} className="h-5 w-5" />
                  </span>
                  <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-yellow-400/90">
                    {t('home.steps.step', { number: item.number })}
                  </p>
                  <h3 className="mt-2 font-display text-xl font-bold">
                    {t(`home.steps.${item.id}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-blue-100/80">
                    {t(`home.steps.${item.id}.text`)}
                  </p>
                </Reveal>
              ))}
            </ol>
          </Reveal>

          <Reveal
            delay={200}
            className="relative rounded-[2rem] bg-white p-9 text-center text-slate-900 shadow-[0_40px_80px_-30px_rgba(0,0,0,0.6)] ring-1 ring-white/10"
          >
            <span className="absolute inset-x-10 top-0 h-1 rounded-b-full bg-yellow-400" />

            <span className="mx-auto flex h-14 w-14 animate-float-slow items-center justify-center rounded-2xl bg-blue-950 text-yellow-400 shadow-lg shadow-blue-950/30">
              <Icon name="user-group" className="h-7 w-7" />
            </span>
            <h3 className="mt-6 font-display text-2xl font-bold text-blue-950">
              {isAuthenticated ? t('home.joinCard.titleMember') : t('home.joinCard.titleGuest')}
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              {isAuthenticated ? t('home.joinCard.textMember') : t('home.joinCard.textGuest')}
            </p>

            <Link
              to={isAuthenticated ? ROUTES.activities : ROUTES.register}
              className="shine group mt-8 flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-6 py-3.5 text-sm font-bold text-blue-950 transition duration-300 hover:-translate-y-0.5 hover:bg-yellow-300 hover:shadow-[0_12px_28px_-12px_rgba(253,199,0,0.9)]"
            >
              {isAuthenticated ? t('home.joinCard.ctaMember') : t('home.joinCard.ctaGuest')}
              <Icon
                name="arrow-right"
                className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </Link>

            {!isAuthenticated && (
              <Link
                to={ROUTES.login}
                className="mt-4 inline-block text-xs font-semibold text-slate-500 underline-offset-4 transition hover:text-blue-950 hover:underline"
              >
                {t('home.joinCard.loginLink')}
              </Link>
            )}
          </Reveal>
        </div>
      </Container>
    </section>
  )
}
