import { BackButton } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatTimeRange } from '@/utils/format.js'

import { HostCard } from './components/HostCard.jsx'
import { NeedToKnowCard } from './components/NeedToKnowCard.jsx'
import { ParticipantsCard } from './components/ParticipantsCard.jsx'

export function GroupDetailView({ group, loading, error, currentUserId }) {
  const { t } = useLanguage()

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <BackButton />

        <p className="text-sm font-semibold text-slate-500">
          {t('groupDetail.loading')}
        </p>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <BackButton />

        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
          {t('groupDetail.loadError')}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <BackButton />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                {t('groupDetail.statusGroup', { status: group.status })}
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                {group.activityTitle}
              </h1>

              <p className="mt-3 text-lg text-slate-600">
                {formatTimeRange(group.startTime, group.endTime, {
                  fallback: t('groupDetail.timePending'),
                  weekday: true,
                  separator: ' • ',
                })}
                {group.locationName && ` • ${group.locationName}`}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-7 py-4 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
            >
              <span>▣</span>
              {t('groupDetail.openChat')}
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <HostCard group={group} />
          <NeedToKnowCard />
        </aside>

        <ParticipantsCard group={group} currentUserId={currentUserId} />
      </main>
    </div>
  )
}
