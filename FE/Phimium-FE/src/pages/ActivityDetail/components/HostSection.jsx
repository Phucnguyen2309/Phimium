import { Icon } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

// Buddy chỉ được Phimium xếp sau khi khách đặt tour (WAITING_FOR_BUDDY -> BUDDY_ASSIGNED),
// nên trang chi tiết giải thích quy trình thay vì hiện tên Buddy.
const STEPS = [
  { id: 'book', icon: 'ticket' },
  { id: 'match', icon: 'user-group' },
  { id: 'meet', icon: 'user' },
]

export function HostSection() {
  const { t } = useLanguage()

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
      <p className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
        <Icon name="check-circle" className="h-4 w-4" />
        {t('activityDetail.host.eyebrow')}
      </p>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-blue-950">{t('activityDetail.host.title')}</h2>
      <p className="mt-3 text-[15px] leading-7 text-slate-600">{t('activityDetail.host.text')}</p>

      <ol className="mt-5 grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => (
          <li key={step.id} className="relative rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100">
            <span className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-950 text-yellow-400">
                <Icon name={step.icon} className="h-5 w-5" />
              </span>
              <span className="font-display text-sm font-bold text-slate-400">0{index + 1}</span>
            </span>
            <p className="mt-3 text-sm font-bold text-blue-950">{t(`activityDetail.host.steps.${step.id}.title`)}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">{t(`activityDetail.host.steps.${step.id}.text`)}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
