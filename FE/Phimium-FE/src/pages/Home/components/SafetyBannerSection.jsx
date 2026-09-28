import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

export function SafetyBannerSection({ isAuthenticated = false }) {
  const { t } = useLanguage()

  return (
    <section className="bg-white py-16">
      <Container>
        <div className="flex flex-col gap-8 rounded-2xl border border-slate-200 border-l-8 border-l-blue-950 bg-slate-50 p-6 shadow-sm sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
              {t('home.safety.eyebrow')}
            </p>
            <h2 className="mt-3 text-2xl font-black text-blue-950">
              {t('home.safety.title')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {t('home.safety.text')}
            </p>
          </div>

          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link
              to={ROUTES.activities}
              className="rounded-lg bg-blue-950 px-6 py-3 text-center text-sm font-black text-white transition hover:bg-blue-900"
            >
              {t('home.featured.viewAll')}
            </Link>
            {!isAuthenticated && (
              <Link
                to={ROUTES.register}
                className="rounded-lg border border-blue-950 px-6 py-3 text-center text-sm font-black text-blue-950 transition hover:bg-blue-50"
              >
                {t('auth.register.title')}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
