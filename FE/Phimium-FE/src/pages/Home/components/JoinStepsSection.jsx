import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'

const STEPS = [
  { id: 'choose', number: '01' },
  { id: 'confirm', number: '02' },
  { id: 'meet', number: '03' },
]

export function JoinStepsSection({ isAuthenticated = false }) {
  const { t } = useLanguage()

  return (
    <section className="bg-blue-950 py-20 text-white">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
              {t('home.steps.eyebrow')}
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {t('home.steps.title')}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">
              {t('home.steps.subtitle')}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {STEPS.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider text-yellow-400">
                    {t('home.steps.step', { number: item.number })}
                  </p>
                  <h3 className="mt-2 font-black">{t(`home.steps.${item.id}.title`)}</h3>
                  <p className="mt-2 text-xs leading-5 text-blue-200">{t(`home.steps.${item.id}.text`)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 text-center text-slate-900 shadow-2xl">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100 text-2xl">
              🤝
            </span>
            <h3 className="mt-4 text-xl font-black text-blue-950">
              {isAuthenticated
                ? t('home.joinCard.titleMember')
                : t('home.joinCard.titleGuest')}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {isAuthenticated
                ? t('home.joinCard.textMember')
                : t('home.joinCard.textGuest')}
            </p>

            <Link
              to={isAuthenticated ? ROUTES.activities : ROUTES.register}
              className="mt-6 block rounded-lg bg-yellow-400 px-6 py-3 text-sm font-black text-blue-950 transition hover:bg-yellow-300"
            >
              {isAuthenticated
                ? t('home.joinCard.ctaMember')
                : t('home.joinCard.ctaGuest')}
            </Link>

            {!isAuthenticated && (
              <Link
                to={ROUTES.login}
                className="mt-3 block text-xs font-semibold text-slate-500 hover:text-blue-800"
              >
                {t('home.joinCard.loginLink')}
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
