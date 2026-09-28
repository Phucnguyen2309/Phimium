import { useMemo } from 'react'

import { GROUP_STATUS_STYLES } from '@/constants/activity.js'
import { useLanguage } from '@/context/languageContext.js'

import { ParticipantSlot } from './ParticipantSlot.jsx'

const formatStatus = (status) => String(status ?? 'UNKNOWN').toUpperCase()

export function ParticipantsCard({ group, currentUserId }) {
  const { t } = useLanguage()

  const slots = useMemo(() => {
    const participants = Array.isArray(group.participants)
      ? group.participants
      : []

    const maximum = Number(group.maximumParticipants ?? 0)

    if (maximum <= participants.length) return participants

    return [
      ...participants,
      ...Array.from({ length: maximum - participants.length }, () => null),
    ]
  }, [group])

  const status = formatStatus(group.status)
  const statusClass =
    GROUP_STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            {t('groupDetail.participants')}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {t('groupDetail.participantsSubtitle')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-4 py-2 text-sm font-black ${statusClass}`}
          >
            {status}
          </span>

          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-slate-700">
            {t('groupDetail.spotsFilled', {
              current: group.currentParticipants,
              max: group.maximumParticipants,
            })}
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((participant, index) => (
          <ParticipantSlot
            key={participant?.userId ?? `empty-${index}`}
            participant={participant}
            isCurrentUser={
              Boolean(participant) &&
              Boolean(currentUserId) &&
              String(participant.userId) === String(currentUserId)
            }
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-4 rounded-xl bg-blue-50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8.59 13.51l6.83 3.98M15.41 6.51L8.59 10.49M18 5a3 3 0 11-6 0 3 3 0 016 0zM6 14a3 3 0 100-6 3 3 0 000 6zm12 7a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
          </div>

          <div>
            <h3 className="font-black text-slate-950">
              {t('groupDetail.shareTitle')}
            </h3>
            <p className="text-sm text-slate-500">
              {t('groupDetail.shareText')}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="rounded-lg bg-white px-6 py-3 text-sm font-black text-blue-600 shadow-sm transition hover:bg-blue-50"
        >
          {t('groupDetail.copyLink')}
        </button>
      </div>
    </section>
  )
}
