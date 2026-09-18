import { Link } from 'react-router-dom'
import { ROUTES } from '@/routes/paths.js'
import PopularActivityCard from './PopularActivityCard.jsx'

export function PopularActivitiesSection({ activities = [], loading = false }) {
  const popularActivities = Array.isArray(activities)
    ? activities.slice(0, 8)
    : []

  return (
    <section>
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-950">
          Featured Tours
        </h2>
        <Link
          to={ROUTES.activities}
          className="text-sm font-bold text-blue-800 transition hover:text-blue-900 flex items-center gap-2"
        >
          View All <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-3xl">
          Loading tours...
        </div>
      ) : popularActivities.length === 0 ? (
        <div className="py-12 text-center text-sm text-slate-500 border border-dashed border-slate-200 rounded-3xl">
          No tours available yet.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {popularActivities.map((activity) => (
            <PopularActivityCard key={activity.id || Math.random()} activity={activity} />
          ))}
        </div>
      )}
    </section>
  )
}
