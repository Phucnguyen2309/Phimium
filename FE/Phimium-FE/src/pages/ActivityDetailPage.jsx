import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Container } from '../components/common'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import activityService from '../services/activityService'

const fallbackDetail = {
  title: 'Artisanal Pottery Workshop',
  description: 'Master the wheel with professional local ceramists and create your own ceramic piece.',
  thumbnailUrl: 'https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=1200&auto=format&fit=crop',
  startTime: '2026-07-10T09:00:00',
  locationName: 'Clay Studio District',
  address: '12 Nguyen Trai, District 1, Ho Chi Minh City',
  participationFee: 450000,
  minimumParticipants: 4,
  maximumParticipants: 6,
  groupMinSize: 4,
  groupMaxSize: 6,
  hostBuddyName: 'Buddy Linh',
  activityType: 'Workshop',
  status: 'PUBLISHED',
}

const formatDateTime = (dateValue) => {
  if (!dateValue) return 'TBA'

  const date = new Date(dateValue)
  if (Number.isNaN(date.getTime())) return 'TBA'

  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const formatMoney = (value) => {
  const amount = Number(value)
  if (!amount || amount <= 0) return 'Free'
  return `${amount.toLocaleString('vi-VN')} VND`
}

const ActivityDetailPage = () => {
  const { id } = useParams()
  const [activity, setActivity] = useState(fallbackDetail)
  const [loading, setLoading] = useState(false)

  useDocumentTitle(activity?.title ? `${activity.title}` : 'Activity Detail')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null' || !id) {
      return
    }

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await activityService.getActivityById(id)
        const detail = response?.data?.data ?? response?.data
        if (detail) {
          setActivity({ ...fallbackDetail, ...detail })
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy chi tiết hoạt động:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [id])

  return (
    <Container className="py-6 sm:py-10">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="relative min-h-[360px] bg-slate-900">
            <img
              src={activity.thumbnailUrl}
              alt={activity.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">Activity Detail</p>
              <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{activity.title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85">{activity.description}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-slate-500">Thời gian</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{formatDateTime(activity.startTime)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-500">Địa điểm</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{activity.locationName}</p>
                <p className="mt-1 text-sm text-slate-600">{activity.address}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Phí tham gia</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">{formatMoney(activity.participationFee)}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Group size</p>
                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {activity.groupMinSize ?? 4}-{activity.groupMaxSize ?? 6}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-500">Buddy dẫn đoàn</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">{activity.hostBuddyName ?? 'Not assigned yet'}</p>
                <p className="mt-1 text-sm text-slate-600">Type: {activity.activityType ?? 'N/A'}</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button className="flex-1 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600">
                  Join
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back
                </Link>
              </div>

              {loading && <p className="text-sm text-slate-500">Đang tải chi tiết...</p>}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default ActivityDetailPage
