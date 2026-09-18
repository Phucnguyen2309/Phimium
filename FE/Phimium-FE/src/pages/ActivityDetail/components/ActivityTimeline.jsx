export function ActivityTimeline() {
  const events = [
    {
      time: "09:00 AM",
      title: "The Ancient Market",
      description: "Start with a seasonal fruit tasting and historical briefing at the old central market.",
      isFirst: true,
      isLast: false,
    },
    {
      time: "10:30 AM",
      title: "Hidden Alleyway Noodle Bar",
      description: "Navigate the narrow alleys to find the city's best-kept secret for Bun Bo Hue.",
      isFirst: false,
      isLast: false,
    },
    {
      time: "12:00 PM",
      title: "Rooftop Sipping",
      description: "Conclude with egg coffee and a view of the evolving Saigon skyline.",
      isFirst: false,
      isLast: true,
    }
  ]

  return (
    <section className="mt-8 px-6 sm:px-8 mb-24">
      <h2 className="text-xl font-black text-slate-950 mb-6">
        Tour Timeline
      </h2>

      <div className="flex flex-col gap-0">
        {events.map((event, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex flex-col items-center">
              {/* Dot */}
              <div className={`h-3 w-3 rounded-full mt-1.5 ${event.isFirst ? 'bg-blue-900' : 'bg-slate-300'}`}></div>
              {/* Line */}
              {!event.isLast && <div className="w-px bg-slate-200 flex-1 my-1"></div>}
            </div>
            
            <div className="pb-8 pt-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900">
                {event.time} <span className="text-slate-400 font-normal px-1">-</span> {event.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
