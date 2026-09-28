import { UserAvatar } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'

export function HostCard({ group }) {
  const { t } = useLanguage()

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">{t('groupDetail.host')}</h2>

      <div className="mt-6 flex gap-4">
        <UserAvatar
          name={group.hostName}
          avatarUrl={group.hostAvatar}
          className="h-20 w-20 text-xl"
        />

        <div>
          <h3 className="font-black text-slate-950">{group.hostName}</h3>
          <p className="mt-1 text-sm text-slate-500">{t('myGroups.groupBuddy')}</p>

        </div>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-lg border border-blue-600 px-4 py-3 text-sm font-black text-blue-600 transition hover:bg-blue-50"
      >
        {t('groupDetail.viewProfile')}
      </button>
    </section>
  )
}
