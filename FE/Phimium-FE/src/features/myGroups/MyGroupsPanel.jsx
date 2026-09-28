import { useLanguage } from '@/context/languageContext.js'

import { MyGroupCard } from './components/MyGroupCard.jsx'
import { useMyGroups } from './useMyGroups.js'

export function MyGroupsPanel() {
  const { t } = useLanguage()
  const { groups, loading, error } = useMyGroups()

  const groupList = Array.isArray(groups) ? groups : []

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-black text-slate-950">{t('dashboard.tabs.groups')}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t('myGroups.loading')}
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-[390px] animate-pulse rounded-3xl bg-white shadow-sm"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-black text-slate-950">{t('dashboard.tabs.groups')}</h1>

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-600">
          {t('myGroups.loadError')}
        </div>
      </div>
    )
  }

  if (groupList.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-black text-slate-950">{t('dashboard.tabs.groups')}</h1>

        <div className="mt-5 rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 p-8 text-center">
          <h2 className="text-lg font-black text-slate-950">
            {t('myGroups.emptyTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {t('myGroups.emptyText')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-950">{t('dashboard.tabs.groups')}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {t('myGroups.subtitle')}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groupList.map((group, index) => (
          <MyGroupCard
            key={group.id || group.groupId}
            group={group}
            index={index}
          />
        ))}
      </div>
    </div>
  )
}