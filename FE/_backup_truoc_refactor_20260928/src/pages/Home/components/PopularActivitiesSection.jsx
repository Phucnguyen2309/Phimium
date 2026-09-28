import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { ROUTES } from '@/routes/paths.js'

import PopularActivityCard from './PopularActivityCard.jsx'

export function PopularActivitiesSection({ activities = [], loading = false }) {
  const popularActivities = Array.isArray(activities)
    ? activities.slice(0, 4)
    : []

  return (
    <section id="popular-activities" className="bg-slate-50 py-16">
      <Container>
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-slate-950">
              Hoạt động nổi bật
            </h2>

            <p className="mt-2 text-sm text-slate-600">
              Những trải nghiệm được cộng đồng PHIMIUM yêu thích tuần này.
            </p>
          </div>

          <Link
            to={ROUTES.activities}
            className="hidden items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 sm:inline-flex"
          >
            Xem tất cả <span>→</span>
          </Link>
        </div>

        {loading ? (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white py-16 text-center text-slate-500">
            Đang tải hoạt động...
          </div>
        ) : popularActivities.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-emerald-200 bg-white py-16 text-center">
            <h3 className="text-lg font-black text-slate-950">
              Chưa có hoạt động nào
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Khi hệ thống có hoạt động, danh sách sẽ hiện ở đây.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            <PopularActivityCard activity={popularActivities[0]} variant="feature" />

            <div className="grid gap-6 sm:grid-cols-2">
              {popularActivities[1] && (
                <PopularActivityCard
                  activity={popularActivities[1]}
                  variant="wide"
                  className="sm:col-span-2"
                />
              )}

              {popularActivities.slice(2, 4).map((activity) => (
                <PopularActivityCard
                  key={activity.id}
                  activity={activity}
                  variant="small"
                />
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  )
}