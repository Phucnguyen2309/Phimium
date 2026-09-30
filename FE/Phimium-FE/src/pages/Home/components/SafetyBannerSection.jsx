import { Link } from 'react-router-dom'

import { Container, Icon, Reveal } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

export function SafetyBannerSection({ isAuthenticated = false }) {
  const { t } = useLanguage()

  return (
    <section className="bg-white py-20 sm:py-24">
      <Container>
        <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-50 to-white p-8 ring-1 ring-slate-200/80 sm:p-12">
          <span className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-yellow-400 to-blue-950" />
          <Icon
            name="shield-check"
            className="absolute -right-10 -top-10 -z-10 h-64 w-64 animate-float-slow text-slate-100"
            strokeWidth={1}
          />

          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex max-w-2xl gap-5">
              <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-950 text-yellow-400 shadow-lg shadow-blue-950/20 sm:flex">
                <Icon name="shield-check" className="h-7 w-7" />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-700">
                  {t('home.safety.eyebrow')}
                </p>
                <h2 className="mt-3 font-display text-3xl font-bold text-blue-950">
                  {t('home.safety.title')}
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{t('home.safety.text')}</p>
              </div>
            </div>

            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                to={ROUTES.activities}
                className="shine group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-950 px-7 py-3.5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-lg hover:shadow-blue-950/25"
              >
                {t('home.featured.viewAll')}
                <Icon
                  name="arrow-right"
                  className="h-4 w-4 transition duration-300 group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </Link>
              {!isAuthenticated && (
                <Link
                  to={ROUTES.register}
                  className="inline-flex items-center justify-center rounded-xl border border-blue-950/80 px-7 py-3.5 text-sm font-semibold text-blue-950 transition duration-300 hover:bg-blue-950 hover:text-white"
                >
                  {t('auth.register.title')}
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
