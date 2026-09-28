import { formatDateTime, formatMoney } from '../activityDetailData.js'
import { getInitials } from '../activityDetailUtils.js'

function BuddyAvatar({ name, avatarUrl }) {
  const hasAvatar = avatarUrl && avatarUrl !== 'string'

  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-lg font-black text-white">
      {getInitials(name)}

      {hasAvatar && (
        <img
          src={avatarUrl}
          alt={name || 'Buddy'}
          className="absolute inset-0 h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      )}
    </div>
  )
}

export function ActivityHostBookingCard({
  activity,
  joining,
  handleJoinClick,
}) {
  const hostName = activity?.hostBuddyName || 'Chưa có Buddy phụ trách'

  const hostAvatar =
    activity?.avatarUrl ||
    activity?.hostAvatar ||
    activity?.hostBuddyAvatar ||
    ''

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
      <div className="flex gap-4">
        <BuddyAvatar name={hostName} avatarUrl={hostAvatar} />

        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-black text-slate-950">
            {hostName}
          </h2>

          <p className="text-xs font-semibold text-orange-700">
            Activity Host
          </p>

          <div className="mt-2 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
              Verified
            </span>

            <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-700">
              Buddy
            </span>
          </div>
        </div>
      </div>

      {activity?.introduction && (
        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
          {activity.introduction}
        </p>
      )}

      <div className="my-5 border-t border-slate-100" />

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Total price
          </p>

          <p className="mt-1 text-2xl font-black text-slate-950">
            {formatMoney(activity?.participationFee)}
          </p>

          <p className="text-xs text-slate-500">/ person</p>
        </div>

        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
          Booking
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-bold text-slate-700">
          Select date & time
        </p>

        <div className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800">
          {formatDateTime(activity?.startTime)}
        </div>
      </div>

      <button
        type="button"
        onClick={handleJoinClick}
        disabled={joining}
        className="mt-5 flex w-full items-center justify-center rounded-lg bg-blue-700 px-5 py-3 text-sm font-black text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {joining ? 'Đang xử lý...' : 'Reserve your spot'}
      </button>

      <p className="mt-3 text-center text-xs text-slate-500">
        You won’t be charged yet.
      </p>
    </aside>
  )
}