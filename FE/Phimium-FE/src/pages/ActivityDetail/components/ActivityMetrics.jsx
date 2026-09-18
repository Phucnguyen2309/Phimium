import { ClockIcon, ForkKnifeIcon, UsersIcon } from './ActivityDetailIcons.jsx'

export function ActivityMetrics({ activity }) {
  // Mock data for hours and tastings, use API for guests if available
  const hours = "3-3.5 hours"
  const guests = activity?.maximumParticipants 
    ? `${activity?.minimumParticipants || 1}-${activity.maximumParticipants} guests` 
    : "2-6 guests"
  const tastings = "5-7 tastings"

  return (
    <div className="mx-6 sm:mx-8 -mt-8 relative z-10 flex flex-row gap-3">
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-blue-50/50 p-3 text-center shadow-sm border border-slate-100">
        <div className="text-blue-900 mb-1">
            <ClockIcon />
        </div>
        <span className="text-[11px] font-bold text-slate-800">{hours}</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-blue-50/50 p-3 text-center shadow-sm border border-slate-100">
        <div className="text-blue-900 mb-1">
            <UsersIcon />
        </div>
        <span className="text-[11px] font-bold text-slate-800">{guests}</span>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl bg-blue-50/50 p-3 text-center shadow-sm border border-slate-100">
        <div className="text-blue-900 mb-1">
            <ForkKnifeIcon />
        </div>
        <span className="text-[11px] font-bold text-slate-800">{tastings}</span>
      </div>
    </div>
  )
}
