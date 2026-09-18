import { ShieldIcon } from './ActivityDetailIcons.jsx'
import { getValidImage } from '../activityDetailUtils.js'

export function ActivityHero({ activity }) {
  const activityImage = getValidImage(activity?.thumbnailUrl)

  // Placeholder for demo
  const imageUrl = activity?.thumbnailUrl || "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
  
  return (
    <div className="relative h-[450px] w-full">
      <img
        src={imageUrl}
        alt={activity?.title || "Activity Cover"}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
      
      <div className="absolute bottom-6 left-0 right-0">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="rounded bg-blue-900/90 backdrop-blur px-2 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
              VERIFIED EXPERIENCE
            </span>
          </div>
          <h1 className="text-3xl font-light leading-tight text-blue-950 sm:text-5xl lg:text-6xl max-w-2xl">
            {activity?.title || "Saigon Food Stories - Walking Tour"}
          </h1>
        </div>
      </div>
    </div>
  )
}