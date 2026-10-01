import { Icon, UserAvatar } from '@/components/common'
import { USER_ROLES } from '@/constants/app.js'
import { useLanguage } from '@/context/languageContext.js'
import { normalizeRole } from '@/utils/role.js'

function Stat({ value, label, accent }) {
  return (
    <div className="min-w-0">
      <p className={`font-display text-4xl font-bold leading-none sm:text-5xl ${accent}`}>{value}</p>
      <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    </div>
  )
}

export function ProfileCard({ user, stats }) {
  const { t } = useLanguage()

  const username = user?.username ?? ''
  const email = username.includes('@') ? username : ''
  // Ưu tiên họ tên thật (fullName từ Backend), chưa có thì lấy phần trước @ của email
  const displayName =
    user?.fullName?.trim() || (email ? username.split('@')[0] : username) || t('nav.myAccount')
  const role = normalizeRole(user?.role) || USER_ROLES.user

  return (
    <section className="rounded-[1.75rem] border border-slate-200/80 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(22,36,86,0.45)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-5">
          <div className="relative">
            <UserAvatar
              name={displayName}
              className="h-20 w-20 text-2xl ring-4 ring-white shadow-lg sm:h-24 sm:w-24 sm:text-3xl"
              colorClassName="bg-gradient-to-br from-blue-950 to-blue-800 text-yellow-400"
            />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white ring-4 ring-white">
              <Icon name="check" className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-3xl font-extrabold tracking-tight text-blue-950 sm:text-4xl">
                {displayName}
              </h1>
              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-900 ring-1 ring-blue-100">
                {t(`userDashboard.profile.roles.${role}`)}
              </span>
            </div>
            {email && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
                <Icon name="envelope" className="h-4 w-4 text-slate-400" />
                <span className="truncate">{email}</span>
              </p>
            )}
          </div>
        </div>

        {stats.buddies.length > 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100 lg:max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
              {t('userDashboard.profile.buddiesTitle')}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {stats.buddies.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-blue-950 ring-1 ring-slate-200"
                >
                  <Icon name="user" className="h-3.5 w-3.5 text-yellow-600" />
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-7 grid grid-cols-1 gap-6 rounded-2xl bg-slate-50/80 px-5 py-6 ring-1 ring-slate-100 sm:grid-cols-3 sm:px-8">
        <Stat value={stats.completed} label={t('userDashboard.profile.completed')} accent="text-blue-950" />
        <Stat value={stats.upcoming} label={t('userDashboard.profile.upcoming')} accent="text-yellow-600" />
        <Stat value={stats.reviews} label={t('userDashboard.profile.reviews')} accent="text-emerald-600" />
      </div>
    </section>
  )
}
