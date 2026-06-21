import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useGroupDetail } from './useGroupDetail.js'

const STATUS_STYLES = {
  READY: 'bg-emerald-50 text-emerald-700',
  ONGOING: 'bg-blue-50 text-blue-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-rose-50 text-rose-600',
}

function formatStatus(status) {
  return String(status ?? 'UNKNOWN').toUpperCase()
}

function formatDateTime(startValue, endValue) {
  if (!startValue) return 'Thời gian chưa cập nhật'

  const start = new Date(startValue)
  const end = endValue ? new Date(endValue) : null

  if (Number.isNaN(start.getTime())) return 'Thời gian chưa cập nhật'

  const dateText = start.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const startText = start.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  if (!end || Number.isNaN(end.getTime())) {
    return `${dateText} • ${startText}`
  }

  const endText = end.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return `${dateText} • ${startText} - ${endText}`
}

function getInitials(name) {
  const cleanName = String(name ?? '').trim()

  if (!cleanName || cleanName === 'string') return 'U'

  const words = cleanName.split(/\s+/)

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  }

  return cleanName.charAt(0).toUpperCase()
}

function BackButton() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate(-1)}
      className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
    >
      <svg
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Quay lại
    </button>
  )
}

function Avatar({ name, avatarUrl, large = false, outlined = false }) {
  const sizeClass = large ? 'h-20 w-20 text-xl' : 'h-14 w-14 text-base'

  return (
    <div
      className={`relative flex ${sizeClass} items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700 ${
        outlined ? 'ring-4 ring-blue-500 ring-offset-4' : ''
      }`}
    >
      {getInitials(name)}

      {avatarUrl && avatarUrl !== 'string' && (
        <img
          src={avatarUrl}
          alt={name || 'User'}
          className="absolute inset-0 h-full w-full rounded-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}

function ParticipantSlot({ participant, isCurrentUser = false }) {
  if (!participant) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-slate-400">
          <svg
            className="h-8 w-8"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18 9v3m0 0v3m0-3h3m-3 0h-3M9 14a4 4 0 100-8 4 4 0 000 8zm0 2c-3 0-5 1.5-5 3v1h10v-1c0-1.5-2-3-5-3z"
            />
          </svg>
        </div>

        <p className="mt-3 font-semibold text-slate-400">Open Spot</p>
        <button
          type="button"
          className="text-sm font-bold text-blue-600 hover:text-blue-700"
        >
          Invite Friend
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative">
        <Avatar
          name={participant.fullName}
          avatarUrl={participant.avatarUrl}
          large
          outlined={isCurrentUser}
        />

        {isCurrentUser && (
          <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-emerald-500" />
        )}
      </div>

      <p className="mt-3 font-black text-slate-950">
        {isCurrentUser ? 'You' : participant.fullName}
      </p>

      <p className="text-sm text-slate-500">
        {isCurrentUser ? 'Joined recently' : 'Participant'}
      </p>
    </div>
  )
}

function HostCard({ group }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">The Host</h2>

      <div className="mt-6 flex gap-4">
        <Avatar name={group.hostName} avatarUrl={group.hostAvatar} large />

        <div>
          <h3 className="font-black text-slate-950">{group.hostName}</h3>
          <p className="mt-1 text-sm text-slate-500">Group Buddy</p>

          <div className="mt-2 text-sm text-orange-500">
            ★★★★★ <span className="text-slate-600">(4.8)</span>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-md bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
          ✓ Verified
        </span>
        <span className="rounded-md bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
          Vietnamese
        </span>
      </div>

      <button
        type="button"
        className="mt-6 w-full rounded-lg border border-blue-600 px-4 py-3 text-sm font-black text-blue-600 transition hover:bg-blue-50"
      >
        View Profile
      </button>
    </section>
  )
}

function NeedToKnowCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-black text-slate-950">Need to Know</h2>

      <div className="mt-6 space-y-5">
        <div className="flex gap-3">
          <span className="mt-1 text-blue-600">ⓘ</span>
          <div>
            <h3 className="font-black text-slate-800">Bring your items</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Chuẩn bị vật dụng cá nhân cần thiết cho hoạt động.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-1 text-slate-500">✓</span>
          <div>
            <h3 className="font-black text-slate-800">Be on time</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Nên đến sớm vài phút để nhóm bắt đầu đúng giờ.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <span className="mt-1 text-slate-500">☁</span>
          <div>
            <h3 className="font-black text-slate-800">Check location</h3>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Kiểm tra địa điểm trước khi di chuyển.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function ParticipantsCard({ group }) {
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
    STATUS_STYLES[status] ?? 'bg-slate-100 text-slate-600'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Participants
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Thành viên đang tham gia nhóm này.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-4 py-2 text-sm font-black ${statusClass}`}
          >
            {status}
          </span>

          <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-black text-slate-700">
            {group.currentParticipants} / {group.maximumParticipants} Spots
            Filled
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {slots.map((participant, index) => (
          <ParticipantSlot
            key={participant?.userId ?? `empty-${index}`}
            participant={participant}
            isCurrentUser={index === 0 && Boolean(participant)}
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
              Know someone interested?
            </h3>
            <p className="text-sm text-slate-500">
              Share this group link to help fill the remaining spots.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigator.clipboard?.writeText(window.location.href)}
          className="rounded-lg bg-white px-6 py-3 text-sm font-black text-blue-600 shadow-sm transition hover:bg-blue-50"
        >
          Copy Link
        </button>
      </div>
    </section>
  )
}

export default function GroupDetailPage() {
  const { group, loading, error } = useGroupDetail()

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <BackButton />

        <p className="text-sm font-semibold text-slate-500">
          Đang tải chi tiết nhóm...
        </p>
      </div>
    )
  }

  if (error || !group) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <BackButton />

        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-red-600">
          Không thể tải chi tiết nhóm.
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
                {group.status} GROUP
              </p>

              <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">
                {group.activityTitle}
              </h1>

              <p className="mt-3 text-lg text-slate-600">
                {formatDateTime(group.startTime, group.endTime)}
                {group.locationName && ` • ${group.locationName}`}
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-7 py-4 text-sm font-black text-white shadow-sm transition hover:bg-orange-600"
            >
              <span>▣</span>
              Open Group Chat
            </button>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-6">
          <HostCard group={group} />
          <NeedToKnowCard />
        </aside>

        <ParticipantsCard group={group} />
      </main>
    </div>
  )
}