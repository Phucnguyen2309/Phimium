import { Link } from 'react-router-dom'

import { buildGroupDetailPath } from '@/routes/paths.js'

const STATUS_STYLES = {
  READY: 'bg-emerald-50 text-emerald-700',
  ONGOING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-rose-50 text-rose-600',
}

const STATUS_LABELS = {
  READY: 'READY',
  ONGOING: 'ONGOING',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

const FALLBACK_GRADIENTS = [
  'from-amber-100 via-orange-100 to-stone-200',
  'from-emerald-100 via-teal-100 to-cyan-100',
  'from-slate-100 via-slate-200 to-zinc-300',
]

function formatStatus(status) {
  const value = String(status ?? 'UNKNOWN').toUpperCase()
  return STATUS_LABELS[value] ?? 'UNKNOWN'
}

function formatDate(value) {
  if (!value) return 'TBA'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'TBA'

  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function getValidText(value, fallback = 'U') {
  const text = String(value ?? '').trim()

  if (!text || text === 'string' || text === '.' || text === '-') {
    return fallback
  }

  return text
}

function getAvatarText(name) {
  const cleanName = getValidText(name, 'U')
  const words = cleanName.split(/\s+/)

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  }

  return cleanName.charAt(0).toUpperCase()
}

function getFallbackHost(group, participants) {
  const hostParticipant = participants.find(
    (participant) => participant.userId === group?.hostId,
  )

  return {
    fullName:
      getValidText(group?.hostName, '') ||
      getValidText(hostParticipant?.fullName, '') ||
      getValidText(participants[0]?.fullName, 'Unknown buddy'),

    avatarUrl:
      group?.hostAvatar && group.hostAvatar !== 'string'
        ? group.hostAvatar
        : hostParticipant?.avatarUrl || '',
  }
}

function Avatar({ name, avatarUrl, size = 'md' }) {
  const hasAvatar = avatarUrl && avatarUrl !== 'string'

  const sizeClass = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-9 w-9 text-sm'

  if (hasAvatar) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User'}
        className={`${sizeClass} rounded-full border-2 border-white object-cover`}
        onError={(event) => {
          event.currentTarget.style.display = 'none'
        }}
      />
    )
  }

  return (
    <div
      className={`flex ${sizeClass} items-center justify-center rounded-full border-2 border-white bg-emerald-100 font-black text-emerald-700`}
    >
      {getAvatarText(name)}
    </div>
  )
}

function GroupImageFallback({ index = 0, disabled = false }) {
  const gradient = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length]

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} ${
        disabled ? 'grayscale' : ''
      }`}
    >
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-lg font-black text-emerald-700 shadow-sm">
          P
        </div>
        <p className="mt-2 text-xs font-bold text-slate-600">
          Phimium Group
        </p>
      </div>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7V3m8 4V3M5 11h14M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z"
      />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg
      className="h-4 w-4 text-slate-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m0-4a4 4 0 100-8 4 4 0 000 8zm8 0a4 4 0 100-8 4 4 0 000 8z"
      />
    </svg>
  )
}

export function MyGroupCard({ group, index = 0 }) {
  const participants = Array.isArray(group?.participants)
    ? group.participants
    : []

  const status = formatStatus(group?.status)
  const statusClass =
    STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-500'

  const isCancelled = status === 'CANCELLED'

  const host = getFallbackHost(group, participants)

  const currentParticipants =
    group?.currentParticipants ?? participants.length

  const maximumParticipants = group?.maximumParticipants ?? 0

  const hasThumbnail =
    group?.thumbnailUrl && group.thumbnailUrl !== 'string'

  return (
    <article
      className={`flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
        isCancelled ? 'opacity-70' : ''
      }`}
    >
      <div className="relative h-40 overflow-hidden">
        {hasThumbnail ? (
          <img
            src={group.thumbnailUrl}
            alt={group.groupName || 'Group'}
            className={`h-full w-full object-cover ${
              isCancelled ? 'grayscale' : ''
            }`}
          />
        ) : (
          <GroupImageFallback index={index} disabled={isCancelled} />
        )}

        <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700 shadow-sm">
          Group
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black text-slate-950">
              {group?.groupName || 'Nhóm chưa có tên'}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Activity Group
            </p>
          </div>

          <span
            className={`shrink-0 rounded-md px-2.5 py-1 text-[10px] font-black ${statusClass}`}
          >
            {status}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Avatar
            name={host.fullName}
            avatarUrl={host.avatarUrl}
            size="md"
          />

          <div className="min-w-0">
            <p className="text-xs text-slate-500">Group Buddy</p>
            <p className="truncate text-sm font-bold text-slate-700">
              {host.fullName}
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span>{formatDate(group?.createdAt)}</span>
          </div>

          <div className="flex items-center gap-2">
            <UsersIcon />
            <span className="font-bold text-emerald-700">
              {currentParticipants}/{maximumParticipants} participants
            </span>
          </div>
        </div>
        <div className="mt-auto pt-5">
          {group?.groupId ? (
            <Link
  to={buildGroupDetailPath(group.groupId)}
  className="flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-emerald-800"
>
  View Group Detail
</Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex w-full cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400"
            >
              View Group Detail
            </button>
          )}
        </div>
      </div>
    </article>
  )
}