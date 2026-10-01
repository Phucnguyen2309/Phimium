import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatDate, formatMoney } from '@/utils/format.js'

const VISIBLE_PAYMENTS = 4

const STATUS_TONES = {
  PAID: 'bg-emerald-400/20 text-emerald-200',
  PENDING: 'bg-yellow-400/20 text-yellow-200',
  REVIEW_REQUIRED: 'bg-yellow-400/20 text-yellow-200',
  FAILED: 'bg-red-400/20 text-red-200',
  EXPIRED: 'bg-white/10 text-blue-200',
}

export function PaymentsCard({ payments }) {
  const { t } = useLanguage()

  const paidTotal = payments
    .filter((payment) => payment.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <section className="relative isolate overflow-hidden rounded-[1.75rem] bg-blue-950 p-6 text-white shadow-[0_30px_60px_-30px_rgba(22,36,86,0.8)] sm:p-7">
      <span aria-hidden="true" className="absolute -bottom-20 -right-16 -z-10 h-56 w-56 rounded-full bg-blue-700/40 blur-3xl" />

      <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-yellow-300">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
        {t('userDashboard.payments.eyebrow')}
      </span>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight">{t('userDashboard.payments.title')}</h2>

      {payments.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-blue-100/80">{t('userDashboard.payments.empty')}</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-blue-100/80">
            {t('userDashboard.payments.paidTotal', { amount: formatMoney(paidTotal) })}
          </p>

          <ul className="mt-5 space-y-2.5">
            {payments.slice(0, VISIBLE_PAYMENTS).map((payment) => (
              <li key={payment.id} className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3.5 py-3 ring-1 ring-white/10">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-yellow-300">
                  <Icon name="credit-card" className="h-4.5 w-4.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">
                    {payment.invoiceNumber || t('userDashboard.payments.noInvoice')}
                  </span>
                  <span className="block text-[11px] text-blue-200/80">
                    {formatDate(payment.paidAt || payment.createdAt)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-sm font-extrabold">{formatMoney(payment.amount)}</span>
                  <span className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${STATUS_TONES[payment.status] ?? STATUS_TONES.EXPIRED}`}>
                    {t(`userDashboard.payments.status.${payment.status}`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {payments.length > VISIBLE_PAYMENTS && (
            <p className="mt-3 text-center text-[11px] font-semibold text-blue-200/80">
              {t('userDashboard.payments.more', { count: payments.length - VISIBLE_PAYMENTS })}
            </p>
          )}
        </>
      )}
    </section>
  )
}
