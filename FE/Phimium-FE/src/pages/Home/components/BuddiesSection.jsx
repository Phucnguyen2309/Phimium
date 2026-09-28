import { Container, UserAvatar } from '@/components/common'
import { useLanguage } from '@/context/languageContext.js'
import { formatActivityType } from '@/features/activity/activityMapper.js'

export function BuddiesSection({ buddies = [] }) {
  const { t } = useLanguage()

  if (buddies.length === 0) return null

  return (
    <section className="bg-slate-50 py-20">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
            {t('home.buddies.eyebrow')}
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-blue-950 sm:text-4xl">
            {t('home.buddies.title')}
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {t('home.buddies.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {buddies.map((buddy) => (
            <article
              key={buddy.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <UserAvatar
                  name={buddy.name}
                  className="h-14 w-14 text-lg"
                  colorClassName="bg-blue-100 text-blue-900"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-base font-black text-blue-950">
                    {buddy.name}
                  </h3>
                  <p className="text-xs font-semibold text-slate-500">
                    {t('home.buddies.activityCount', { count: buddy.activityTitles.length })}
                  </p>
                </div>
              </div>

              {buddy.activityTypes.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {buddy.activityTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded-full bg-yellow-100 px-2.5 py-1 text-[11px] font-bold text-yellow-800"
                    >
                      {formatActivityType(type)}
                    </span>
                  ))}
                </div>
              )}

              <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm text-slate-600">
                {buddy.activityTitles.slice(0, 3).map((title) => (
                  <li key={title} className="flex gap-2">
                    <span className="text-blue-700" aria-hidden="true">
                      •
                    </span>
                    <span className="line-clamp-1">{title}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  )
}
