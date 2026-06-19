import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/common'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import activityService from '../services/activityService'

const fallbackActivities = [
  {
    id: 'pottery',
    title: 'Artisanal Pottery Workshop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-10T09:00:00',
    minimumParticipants: 4,
    maximumParticipants: 6,
    locationName: 'Clay Studio District',
    participationFee: 450000,
  },
  {
    id: 'coffee',
    title: 'Urban Specialty Coffee',
    thumbnailUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-11T14:00:00',
    minimumParticipants: 4,
    maximumParticipants: 6,
    locationName: 'District 1',
    participationFee: 0,
  },
  {
    id: 'rooftop',
    title: 'Rooftop Socials',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-12T18:30:00',
    minimumParticipants: 4,
    maximumParticipants: 6,
    locationName: 'Skyline Rooftop',
    participationFee: 280000,
  },
  {
    id: 'cowork',
    title: 'Cowork & Connect',
    thumbnailUrl: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop',
    startTime: '2026-07-13T10:00:00',
    minimumParticipants: 4,
    maximumParticipants: 6,
    locationName: 'Shared Studio',
    participationFee: 120000,
  },
]

const formatTime = (dateValue) => {
  if (!dateValue) return 'TBA'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'TBA'

  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getRemainingSlots = (activity) => {
  const max = Number(activity?.maximumParticipants ?? 6)
  const min = Number(activity?.minimumParticipants ?? 0)
  return Math.max(max - min, 0)
}

const mapActivity = (activity, index) => {
  const fallback = fallbackActivities[index % fallbackActivities.length]

  return {
    id: activity?.id ?? fallback.id,
    title: activity?.title ?? fallback.title,
    thumbnailUrl: activity?.thumbnailUrl ?? fallback.thumbnailUrl,
    startTime: activity?.startTime ?? fallback.startTime,
    minimumParticipants: activity?.minimumParticipants ?? fallback.minimumParticipants,
    maximumParticipants: activity?.maximumParticipants ?? fallback.maximumParticipants,
    locationName: activity?.locationName ?? fallback.locationName,
    participationFee: activity?.participationFee ?? fallback.participationFee,
  }
}

const HomePage = () => {
  useDocumentTitle('Explore Activities')
  const [activities, setActivities] = useState(fallbackActivities)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null') {
      return
    }

    const fetchActivities = async () => {
      try {
        setLoading(true)
        const response = await activityService.getAllActivities()
        const activitiesData = response?.data?.data

        if (Array.isArray(activitiesData) && activitiesData.length > 0) {
          setActivities(activitiesData.slice(0, 8).map(mapActivity))
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy danh sách hoạt động:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  return (
    <Container className="py-6 sm:py-10">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Explore</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">Chọn hoạt động phù hợp với bạn</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            Mỗi hoạt động hiển thị tên, hình ảnh, thời gian và số slot còn trống. Chọn card bất kỳ để xem chi tiết.
          </p>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">Danh sách hoạt động</h2>
            <p className="mt-1 text-sm text-slate-500">Hiển thị từ API khi đã login, ngược lại dùng dữ liệu mẫu.</p>
          </div>
          <Link to="/login" className="text-sm font-semibold text-blue-700 hover:text-blue-600">
            Login
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
            Đang tải hoạt động...
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                to={`/activities/${activity.id}`}
                className="group overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={activity.thumbnailUrl}
                    alt={activity.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                    {getRemainingSlots(activity)} slots left
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-slate-950">{activity.title}</h3>
                    <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {activity.participationFee > 0 ? `${activity.participationFee.toLocaleString('vi-VN')} VND` : 'Free'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatTime(activity.startTime)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{activity.locationName}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Container>
  )
}

export default HomePage
