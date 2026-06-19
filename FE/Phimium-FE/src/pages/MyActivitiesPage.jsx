import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '../components/common'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import activityService from '../services/activityService'

const safeList = (value) => (Array.isArray(value) ? value : [])

const MyActivitiesPage = () => {
  useDocumentTitle('My Activities')
  const [registrations, setRegistrations] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || token === 'undefined' || token === 'null') {
      setLoading(false)
      return
    }

    const fetchData = async () => {
      try {
        setLoading(true)
        const [registrationRes, groupRes] = await Promise.all([
          activityService.getMyRegistrations(),
          activityService.getMyGroups(),
        ])

        setRegistrations(safeList(registrationRes?.data?.data ?? registrationRes?.data ?? registrationRes))
        setGroups(safeList(groupRes?.data?.data ?? groupRes?.data ?? groupRes))
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Lỗi khi lấy dashboard:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <Container className="py-6 sm:py-10">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Dashboard</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-950">My Activities</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Xem danh sách hoạt động đã đăng ký và nhóm mà hệ thống đã xếp cho bạn.
        </p>
      </section>

      {loading ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center text-slate-500">
          Đang tải dữ liệu...
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-slate-950">Registered Activities</h2>
              <Link to="/" className="text-sm font-semibold text-blue-700">
                Explore more
              </Link>
            </div>
            <div className="mt-6 space-y-4">
              {registrations.length > 0 ? (
                registrations.map((registration, index) => (
                  <article key={registration?.registrationId ?? index} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {registration?.activity?.title ?? registration?.title ?? 'Activity'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {registration?.activity?.locationName ?? registration?.locationName ?? 'Unknown location'}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {registration?.status ?? 'N/A'}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      Group: {registration?.group?.group_name ?? registration?.group?.groupName ?? 'Waiting for assignment'}
                    </div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chưa có đăng ký nào.</p>
              )}
            </div>
          </section>

          <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">My Groups</h2>
            <div className="mt-6 space-y-4">
              {groups.length > 0 ? (
                groups.map((group, index) => (
                  <article key={group?.groupId ?? index} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-950">
                          {group?.group_name ?? group?.groupName ?? 'Group'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-600">Activity: {group?.activityId ?? 'N/A'}</p>
                      </div>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {group?.status ?? 'READY'}
                      </span>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      Max participants: {group?.maximumParticipants ?? 'N/A'}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">Buddy: {group?.hostId ?? 'TBA'}</div>
                  </article>
                ))
              ) : (
                <p className="text-sm text-slate-500">Chưa có group nào.</p>
              )}
            </div>
          </section>
        </div>
      )}
    </Container>
  )
}

export default MyActivitiesPage
