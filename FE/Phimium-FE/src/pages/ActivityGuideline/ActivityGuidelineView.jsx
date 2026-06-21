import { Link } from 'react-router-dom'

import { Container } from '@/components/common'
import { buildActivityDetailPath, ROUTES } from '@/routes/paths.js'

export function ActivityGuidelineView({
  acknowledged,
  guideline,
  id,
  loading,
  setAcknowledged,
}) {
  return (
    <Container className="py-6 sm:py-10">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">
            Activity Guidelines
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">
            Hướng dẫn và quy tắc an toàn
          </h1>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-slate-50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">
              Instructions
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {guideline.instructions}
            </p>

            <h2 className="mt-8 text-xl font-bold text-slate-950">
              Safety Guidelines
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {guideline.safetyGuidelines}
            </p>

            <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-sm leading-6 text-slate-700">
                Tôi đã đọc và hiểu toàn bộ hướng dẫn, quy tắc an toàn của hoạt
                động này.
              </span>
            </label>

            <button
              type="button"
              disabled={!acknowledged}
              className="mt-6 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Tôi đã đọc và hiểu
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-950">
                Activity Preview
              </h3>
              <p className="mt-2 text-sm text-slate-600">{id}</p>
              {loading && (
                <p className="mt-4 text-sm text-slate-500">
                  Đang tải hướng dẫn...
                </p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to={buildActivityDetailPath(id)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to detail
              </Link>
              <Link
                to={ROUTES.myActivities}
                className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                My Activities
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}
