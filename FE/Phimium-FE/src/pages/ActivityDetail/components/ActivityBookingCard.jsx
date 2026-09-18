export function ActivityBookingCard({ activity, handleJoinClick, joining }) {
  const price = activity?.participationFee || 60

  return (
    <div className="sticky top-24 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
      <div className="mb-6 border-b border-slate-100 pb-6">
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold text-slate-900">${price}</span>
          <span className="text-sm text-slate-500 mb-1">/ person</span>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-4">
          <div>
            <p className="text-xs font-bold text-slate-900">Duration</p>
            <p className="text-xs text-slate-500">5 Hours</p>
          </div>
          <div className="h-8 w-px bg-slate-200"></div>
          <div>
            <p className="text-xs font-bold text-slate-900">Group Size</p>
            <p className="text-xs text-slate-500">Max 12</p>
          </div>
        </div>
      </div>

      <button
        onClick={handleJoinClick}
        disabled={joining}
        className="w-full rounded-xl bg-blue-950 py-4 text-sm font-bold text-white transition hover:bg-blue-900 disabled:opacity-50"
      >
        {joining ? 'Processing...' : 'Book This Experience'}
      </button>

      <p className="mt-4 text-center text-xs text-slate-500">
        You won't be charged yet
      </p>
    </div>
  )
}
