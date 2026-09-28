import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { buildActivityDetailPath, ROUTES } from '@/routes/paths.js'

export function ActivityGuidelineView({
  acknowledged,
  error,
  guideline,
  id,
  isAuthenticated,
  loading,
  setAcknowledged,
}) {
  const { t } = useLanguage()

  const emptyText = !isAuthenticated
    ? t('guideline.loginRequired')
    : loading
      ? t('guideline.loading')
      : error
        ? t('guideline.loadError')
        : t('guideline.empty')

  return (
    <Container className="py-6 sm:py-10">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            {t('guideline.pageTitle')}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            {t('guideline.title')}
          </h1>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-slate-50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">
              {t('guideline.instructions')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {guideline?.instructions || emptyText}
            </p>

            <h2 className="mt-8 text-xl font-bold text-slate-950">
              {t('guideline.safetyRules')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {guideline?.safetyGuidelines || emptyText}
            </p>

            <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-sm leading-6 text-slate-700">
                {t('guideline.acknowledge')}
              </span>
            </label>

            <button
              type="button"
              disabled={!acknowledged || !guideline}
              className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('guideline.acknowledgeButton')}
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-950">
                {t('guideline.preview')}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{id}</p>
              {loading && (
                <p className="mt-4 text-sm text-slate-500">
                  {t('guideline.loading')}
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to={buildActivityDetailPath(id)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {t('guideline.backToDetail')}
              </Link>
              <Link
                to={ROUTES.userDashboard}
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {t('activityDetail.myActivities')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
