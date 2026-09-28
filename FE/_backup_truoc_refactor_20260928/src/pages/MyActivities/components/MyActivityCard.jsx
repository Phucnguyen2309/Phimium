import { PLACEHOLDER_AVATAR, PLACEHOLDER_IMAGE } from '../constants.js'
import ActivityStatusBadge from './ActivityStatusBadge.jsx'

const MyActivityCard = ({ activity }) => {
  const isCompleted = activity.status === 'COMPLETED'
  const isInProgress = activity.status === 'IN_PROGRESS'

  return (
    <article
      className={`overflow-hidden rounded-lg bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] ${
        isInProgress ? 'border border-orange-200' : 'border border-transparent'
      }`}
    >
      <div className="relative h-[150px] overflow-hidden">
        <img
          src={activity.imageUrl}
          alt={activity.title}
          className={`h-full w-full object-cover ${
            isCompleted ? 'opacity-70 saturate-[0.75]' : ''
          }`}
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
        />

        <ActivityStatusBadge activity={activity} />
      </div>

      <div className="flex min-h-[256px] flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2
            className={`max-w-[170px] text-[21px] font-bold leading-[1.12] ${
              isCompleted ? 'text-slate-500' : 'text-slate-950'
            }`}
          >
            {activity.title}
          </h2>

          <span className="rounded bg-teal-100 px-2 py-1 text-[11px] font-medium text-teal-700">
            {activity.category}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
          <img
            src={activity.hostAvatar || PLACEHOLDER_AVATAR}
            alt={activity.hostName || 'Host'}
            className="h-5 w-5 rounded-full object-cover"
            onError={(event) => {
            event.currentTarget.onerror = null
            event.currentTarget.src = PLACEHOLDER_AVATAR
          }}
/>

          <span>Dẫn bởi {activity.hostName}</span>
        </div>

        {isCompleted ? (
          <div className="mt-auto">
            <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
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
                  d="M11.48 3.5l2.23 4.52 4.99.72-3.61 3.52.85 4.97-4.46-2.35-4.46 2.35.85-4.97-3.61-3.52 4.99-.72 2.23-4.52z"
                />
              </svg>

              Bạn đã đánh giá {activity.rating ?? 5} sao
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm"
                type="button"
              >
                Viết đánh giá
              </button>

              <button
                className="rounded-md border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-600 shadow-sm"
                type="button"
              >
                Đặt lại
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
                  />
                </svg>

                <span>{activity.time}</span>
              </div>

              <div className="flex items-start gap-2">
                <svg
                  className="mt-0.5 h-4 w-4 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 10.5a2 2 0 100-4 2 2 0 000 4z"
                  />
                </svg>

                <span>{activity.location}</span>
              </div>
            </div>

            {isInProgress ? (
              <button
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-3 text-xs font-semibold text-white"
                type="button"
              >
                Chỉ đường
              </button>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  className="rounded-md border border-blue-500 px-4 py-3 text-xs font-semibold text-blue-600"
                  type="button"
                >
                  Xem chi tiết
                </button>

                <button
                  className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-xs font-semibold text-white"
                  type="button"
                >
                  Nhắn tin
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default MyActivityCard
