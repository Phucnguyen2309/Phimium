import { Link } from 'react-router-dom'
import { buildActivityDetailPath } from '@/routes/paths.js'

export default function PopularActivityCard({ activity }) {
  if (!activity) return null

  // Fallback image for demo
  const imageUrl = activity.thumbnailUrl || "https://images.unsplash.com/photo-1555126634-323283e090fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  
  const price = activity.participationFee || 45

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100 mb-6 border border-slate-100">
      <div className="relative h-[220px]">
        <img
          src={imageUrl}
          alt={activity.title}
          className="h-full w-full object-cover"
        />
        
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-yellow-950 shadow-sm">
            ${price} / person
          </span>
        </div>

        <div className="absolute bottom-4 left-4">
          <span className="rounded bg-blue-900/80 backdrop-blur px-2 py-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
            VERIFIED PARTNER
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">
            3 Hours
          </span>
          <span className="rounded bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-800">
            English Speaking
          </span>
        </div>

        <h3 className="text-lg font-light leading-snug text-slate-900">
          {activity.title || "Saigon Food Stories - Walking Tour"}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
          {activity.description || "Journey through the secret culinary alleys of District 3 with our expert local"}
        </p>

        <div className="mt-5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-sm">★</span>
            <span className="text-xs font-bold text-slate-800">4.9 <span className="font-normal text-slate-500">(124)</span></span>
          </div>

          <Link
            to={buildActivityDetailPath(activity.id || 1)}
            state={{ activity }}
            className="rounded-xl bg-blue-950 px-5 py-2 text-xs font-bold text-white transition-transform active:scale-95"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  )
}