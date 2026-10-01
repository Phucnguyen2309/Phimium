import { Link } from 'react-router-dom'

import { Icon, UserAvatar } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { buildGroupDetailPath, ROUTES } from '@/routes/paths.js'

export function MyGroupsCard({ groups }) {
  const { t } = useLanguage()

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(22,36,86,0.45)] sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-blue-800">
            {t('userDashboard.groups.eyebrow')}
          </p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-blue-950">
            {t('userDashboard.groups.title')}
          </h2>
        </div>
        <Link to={ROUTES.activities} className="text-xs font-bold text-blue-900 transition hover:text-blue-700">
          {t('userDashboard.groups.browse')}
        </Link>
      </div>

      {groups.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
          {t('userDashboard.groups.empty')}
        </p>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {groups.map((group) => {
            const max = Number(group.maximumParticipants) || 0
            const current = Number(group.currentParticipants) || 0
            const percent = max > 0 ? Math.min(100, Math.round((current / max) * 100)) : 0

            return (
              <li key={group.id}>
                <Link
                  to={buildGroupDetailPath(group.groupId)}
                  className="group flex h-full flex-col rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={group.hostName || group.groupName}
                      avatarUrl={group.hostAvatar}
                      className="h-11 w-11 text-sm"
                      colorClassName="bg-blue-950 text-yellow-400"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-blue-950">{group.groupName}</p>
                      {group.hostName && (
                        <p className="truncate text-[11px] text-slate-500">
                          {t('userDashboard.groups.host', { name: group.hostName })}
                        </p>
                      )}
                    </div>
                    <Icon
                      name="arrow-right"
                      className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-900"
                      strokeWidth={2}
                    />
                  </div>

                  {max > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Icon name="user-group" className="h-3.5 w-3.5" />
                          {t('userDashboard.groups.members', { current, max })}
                        </span>
                        <span>{percent}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-yellow-400" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
