import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatDate, formatMoney } from '@/utils/format.js'

const VISIBLE_PAYMENTS = 6

const STATUS_TONES = {
  PAID: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
  PENDING: 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30',
  REVIEW_REQUIRED: 'bg-yellow-400/20 text-yellow-200 border-yellow-400/30',
  FAILED: 'bg-red-400/20 text-red-200 border-red-400/30',
  EXPIRED: 'bg-white/10 text-blue-200 border-white/10',
}

export function PaymentsCard({ payments }) {
  const { t } = useLanguage()

  const paidTotal = payments
    .filter((payment) => payment.status === 'PAID')
    .reduce((sum, payment) => sum + payment.amount, 0)

  return (
    <section className="relative isolate overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-6 text-white shadow-xl sm:p-8 border border-white/10">
      <span aria-hidden="true" className="absolute -bottom-24 -right-20 -z-10 h-72 w-72 rounded-full bg-blue-600/30 blur-3xl pointer-events-none" />
      <span aria-hidden="true" className="absolute -top-20 -left-20 -z-10 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-yellow-300">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
            {t('userDashboard.payments.eyebrow')}
          </span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-white">{t('userDashboard.payments.title')}</h2>
        </div>

        {payments.length > 0 && (
          <div className="flex items-center gap-3 bg-white/[0.06] rounded-2xl px-4 py-2.5 ring-1 ring-white/10">
            <div className="text-right">
              <span className="text-[11px] text-blue-200/80 block font-medium">
                {t('userDashboard.payments.paidTotal', { amount: '' }).replace('{amount}', '').trim()}
              </span>
              <span className="text-lg font-black text-yellow-400">
                {formatMoney(paidTotal)}
              </span>
            </div>
          </div>
        )}
      </div>

      {payments.length === 0 ? (
        <div className="py-12 text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-yellow-300">
            <Icon name="credit-card" className="h-6 w-6" />
          </div>
          <p className="text-sm font-semibold text-slate-300">{t('userDashboard.payments.empty')}</p>
        </div>
      ) : (
        <>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {payments.slice(0, VISIBLE_PAYMENTS).map((payment) => (
              <li
                key={payment.id}
                className="flex items-center gap-3.5 rounded-2xl bg-white/[0.05] p-3.5 ring-1 ring-white/10 hover:bg-white/[0.08] transition shadow-xs"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-yellow-300">
                  <Icon name="credit-card" className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-white">
                    {payment.invoiceNumber || t('userDashboard.payments.noInvoice')}
                  </span>
                  <span className="block text-xs text-blue-200/70 mt-0.5">
                    {formatDate(payment.paidAt || payment.createdAt)}
                  </span>
                </span>
                <span className="text-right shrink-0">
                  <span className="block text-sm font-black text-white">{formatMoney(payment.amount)}</span>
                  <span
                    className={`mt-1 inline-block rounded-lg px-2 py-0.5 text-[10px] font-bold border ${
                      STATUS_TONES[payment.status] ?? STATUS_TONES.EXPIRED
                    }`}
                  >
                    {t(`userDashboard.payments.status.${payment.status}`)}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          {payments.length > VISIBLE_PAYMENTS && (
            <p className="mt-4 text-center text-xs font-semibold text-blue-200/80">
              {t('userDashboard.payments.more', { count: payments.length - VISIBLE_PAYMENTS })}
            </p>
          )}
        </>
      )}
    </section>
  )
}
