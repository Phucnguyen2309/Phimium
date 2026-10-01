import { Link } from 'react-router-dom'

import { AuthAlert, Container, Icon } from '@/components/common'
import { SiteFooter } from '@/components/layout/SiteFooter.jsx'
import { useLanguage } from '@/context/languageContext.js'
import { ROUTES } from '@/routes/paths.js'
import { formatDateTime, formatMoney } from '@/utils/format.js'

import { RESULT_STATE } from './paymentResultMapper.js'

// Icon + màu cho từng trạng thái
const STATE_STYLES = {
  [RESULT_STATE.paid]: { icon: 'check-circle', ring: 'bg-emerald-50 text-emerald-600 ring-emerald-100', accent: 'from-emerald-400 to-emerald-500' },
  [RESULT_STATE.verifying]: { icon: 'clock', ring: 'bg-yellow-50 text-yellow-600 ring-yellow-100', accent: 'from-yellow-300 to-yellow-400' },
  [RESULT_STATE.review]: { icon: 'shield-check', ring: 'bg-blue-50 text-blue-900 ring-blue-100', accent: 'from-blue-400 to-blue-600' },
  [RESULT_STATE.failed]: { icon: 'x-circle', ring: 'bg-red-50 text-red-600 ring-red-100', accent: 'from-red-400 to-red-500' },
  [RESULT_STATE.cancelled]: { icon: 'x-mark', ring: 'bg-slate-100 text-slate-600 ring-slate-200', accent: 'from-slate-300 to-slate-400' },
  [RESULT_STATE.unknown]: { icon: 'credit-card', ring: 'bg-slate-100 text-slate-600 ring-slate-200', accent: 'from-slate-300 to-slate-400' },
}

function Row({ label, value }) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-4 py-2.5 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-blue-950 break-all">{value}</dd>
    </div>
  )
}

export function PaymentResultView({
  canRetry,
  checkAgain,
  gaveUpVerifying,
  loading,
  payment,
  retryError,
  retryPayment,
  retrying,
  state,
}) {
  const { t } = useLanguage()
  const style = STATE_STYLES[state] ?? STATE_STYLES[RESULT_STATE.unknown]
  const key = state?.toLowerCase()

  return (
    <div className="relative isolate overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[30rem]">
        <span className="absolute -left-24 top-10 h-72 w-72 animate-drift rounded-full bg-yellow-100/70 blur-3xl" />
        <span className="absolute right-0 top-0 h-96 w-96 animate-drift-reverse rounded-full bg-blue-100/70 blur-3xl" />
      </div>

      <Container className="flex min-h-[calc(100svh-4rem)] items-center justify-center py-14">
        <section
          aria-live="polite"
          className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-7 text-center shadow-[0_40px_80px_-40px_rgba(22,36,86,0.5)] sm:p-10"
        >
          <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.accent}`} />

          {loading ? (
            <div className="py-10">
              <span className="mx-auto block h-12 w-12 animate-spin rounded-full border-4 border-blue-950 border-t-transparent" />
              <p className="mt-5 text-sm font-semibold text-slate-500">{t('paymentResult.loading')}</p>
            </div>
          ) : (
            <>
              <span className={`relative mx-auto flex h-20 w-20 animate-pop-in items-center justify-center rounded-full ring-8 ${style.ring}`}>
                {state === RESULT_STATE.verifying && !gaveUpVerifying && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-yellow-300/40" />
                )}
                <Icon name={style.icon} className="relative h-10 w-10" strokeWidth={1.75} />
              </span>

              <h1 className="mt-6 text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl">
                {t(`paymentResult.states.${key}.title`)}
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-[15px] leading-7 text-slate-600">
                {gaveUpVerifying ? t('paymentResult.verifyingSlow') : t(`paymentResult.states.${key}.text`)}
              </p>

              {payment && (
                <dl className="mt-6 divide-y divide-dashed divide-slate-200 rounded-2xl bg-slate-50 px-5 py-1.5 text-left ring-1 ring-slate-100">
                  <Row label={t('paymentResult.amount')} value={formatMoney(payment.amount)} />
                  <Row label={t('paymentResult.invoice')} value={payment.invoiceNumber} />
                  <Row label={t('paymentResult.transaction')} value={payment.providerTransactionId} />
                  <Row
                    label={payment.paidAt ? t('paymentResult.paidAt') : t('paymentResult.createdAt')}
                    value={formatDateTime(payment.paidAt || payment.createdAt, '')}
                  />
                </dl>
              )}

              {retryError && (
                <div className="mt-5 text-left">
                  <AuthAlert>{retryError}</AuthAlert>
                </div>
              )}

              <div className="mt-7 flex flex-col gap-2.5">
                {canRetry && (
                  <button
                    type="button"
                    onClick={retryPayment}
                    disabled={retrying}
                    className="shine inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-extrabold text-blue-950 shadow-[0_14px_30px_-14px_rgba(253,199,0,0.9)] transition hover:bg-yellow-300 disabled:opacity-70"
                  >
                    {retrying ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Icon name="credit-card" className="h-4 w-4" />
                    )}
                    {t('paymentResult.retry')}
                  </button>
                )}

                {state === RESULT_STATE.verifying && gaveUpVerifying && (
                  <button
                    type="button"
                    onClick={checkAgain}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-yellow-400 px-5 py-3.5 text-sm font-extrabold text-blue-950 transition hover:bg-yellow-300"
                  >
                    <Icon name="arrow-path" className="h-4 w-4" />
                    {t('paymentResult.checkAgain')}
                  </button>
                )}

                <Link
                  to={ROUTES.userDashboard}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition ${
                    canRetry || (state === RESULT_STATE.verifying && gaveUpVerifying)
                      ? 'text-blue-950 ring-1 ring-slate-200 hover:bg-slate-50'
                      : 'bg-blue-950 text-white hover:bg-blue-900'
                  }`}
                >
                  {t('paymentResult.toDashboard')}
                  <Icon name="arrow-right" className="h-4 w-4" strokeWidth={2} />
                </Link>

                <Link to={ROUTES.activities} className="py-2 text-xs font-semibold text-slate-500 transition hover:text-blue-950">
                  {t('paymentResult.exploreMore')}
                </Link>
              </div>
            </>
          )}
        </section>
      </Container>

      <SiteFooter />
    </div>
  )
}
