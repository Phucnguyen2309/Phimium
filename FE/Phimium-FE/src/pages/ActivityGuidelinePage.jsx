import { useEffect, useState } from 'react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { Container } from '../components/common'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import activityService from '../services/activityService'

const fallbackGuidelines = {
  pottery: {
    instructions: 'Wear comfortable clothes and follow the instructor step by step.',
    safetyGuidelines: 'Keep hands away from the wheel when it is spinning. Stay hydrated and follow venue rules.',
  },
  coffee: {
    instructions: 'Arrive on time and be open to conversation with the group.',
    safetyGuidelines: 'Respect personal space and follow cafe staff guidance.',
  },
  rooftop: {
    instructions: 'Bring your best energy and be ready for social networking.',
    safetyGuidelines: 'Stay within designated areas and avoid any unsafe edge zones.',
  },
  cowork: {
    instructions: 'Bring your laptop or notebook and keep the workspace tidy.',
    safetyGuidelines: 'Respect quiet zones and shared equipment.',
  },
}

const ActivityGuidelinePage = () => {
  const { id } = useParams()
  const location = useLocation()
  const [guideline, setGuideline] = useState(fallbackGuidelines[id] ?? fallbackGuidelines.pottery)
  const [loading, setLoading] = useState(false)
  const [acknowledged, setAcknowledged] = useState(false)

  useDocumentTitle('Guidelines')

  useEffect(() => {
    if (!id) {
      return
    }

    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null') {
      return
    }

    const fetchGuideline = async () => {
      try {
        setLoading(true)
        const response = await activityService.getGuidelineByActivityId(id)
        const data = response?.data?.data ?? response?.data ?? response
        if (data) {
          setGuideline({ ...fallbackGuidelines[id] ?? fallbackGuidelines.pottery, ...data })
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy guideline:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchGuideline()
  }, [id, location.state])

  return (
    <Container className="py-6 sm:py-10">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Activity Guidelines</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Hướng dẫn và quy tắc an toàn</h1>
        </div>

        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-slate-50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Instructions</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{guideline.instructions}</p>

            <h2 className="mt-8 text-xl font-bold text-slate-950">Safety Guidelines</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{guideline.safetyGuidelines}</p>

            <label className="mt-8 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4">
              <input
                type="checkbox"
                checked={acknowledged}
                onChange={(event) => setAcknowledged(event.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
              />
              <span className="text-sm leading-6 text-slate-700">
                Tôi đã đọc và hiểu toàn bộ hướng dẫn, quy tắc an toàn của hoạt động này.
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
              <h3 className="text-lg font-bold text-slate-950">Activity Preview</h3>
              <p className="mt-2 text-sm text-slate-600">{id}</p>
              {loading && <p className="mt-4 text-sm text-slate-500">Đang tải hướng dẫn...</p>}
            </div>

            <div className="mt-6 flex gap-3">
              <Link
                to={`/activities/${id}`}
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to detail
              </Link>
              <Link
                to="/my-activities"
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

export default ActivityGuidelinePage