import { StoreIcon, CoffeeIcon, DietIcon, FlagIcon } from './ActivityDetailIcons.jsx'

export function ActivityIncludedSection() {
  const inclusions = [
    {
      icon: <StoreIcon />,
      title: "Curated Vendors",
      description: "Access to 4-6 exclusive street-side partners vetted for hygiene and heritage."
    },
    {
      icon: <CoffeeIcon />,
      title: "Coffee & Rest Stop",
      description: "A curated break at a hidden 1980s-era apartment cafe with artisan coffee."
    },
    {
      icon: <DietIcon />,
      title: "Dietary Friendly",
      description: "Full support for non-spicy, vegetarian, and shellfish-free options."
    },
    {
      icon: <FlagIcon />,
      title: "Local Storyteller",
      description: "Private English-speaking guide specializing in Saigon urban history."
    }
  ]

  return (
    <section className="mt-10 px-6 sm:px-8">
      <div className="flex justify-between items-end mb-4">
        <h2 className="text-xl font-black text-slate-950">
          What&apos;s<br/>Included
        </h2>
        <span className="text-sm font-bold text-blue-900 mb-1 max-w-[120px] text-right leading-tight">
          Full Concierge Support
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {inclusions.map((item, index) => (
          <div key={index} className="flex items-start gap-4 rounded-2xl bg-blue-50/60 p-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-900 text-white">
              {item.icon}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-600">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}