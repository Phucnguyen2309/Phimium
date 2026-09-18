export function ActivityBottomBar({ activity, handleJoinClick, joining }) {
  const price = activity?.participationFee || 45

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white p-4 border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
      <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4 px-2 sm:px-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Price per person</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-950">${price}</span>
            <span className="rounded-full bg-yellow-400/20 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
              EARLY BIRD
            </span>
          </div>
        </div>

        <button
          onClick={handleJoinClick}
          disabled={joining}
          className="rounded-xl bg-yellow-400 px-8 py-3 text-sm font-bold text-yellow-950 shadow-sm transition-all active:scale-95 disabled:opacity-70"
        >
          {joining ? 'Processing...' : 'Book Now'}
        </button>
      </div>
    </div>
  )
}
