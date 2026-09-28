const ActivityStatusBadge = ({ activity }) => {
  const isInProgress = activity.status === 'IN_PROGRESS'
  const isCompleted = activity.status === 'COMPLETED'

  return (
    <span
      className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
        isInProgress
          ? 'bg-orange-500 text-white'
          : isCompleted
            ? 'bg-white/85 text-slate-600'
            : 'bg-white text-blue-600'
      }`}
    >
      {isInProgress ? (
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      ) : (
        <svg
          className="h-3 w-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      )}

      {activity.statusLabel}
    </span>
  )
}

export default ActivityStatusBadge
