import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/context/authContext.js'
import { useDocumentTitle } from '@/hooks/useDocumentTitle.js'
import activityService from '@/services/activityService.js'

const fallbackActivities = [
  {
    id: 'morning-vinyasa',
    title: 'Morning Vinyasa Flow',
    hostName: 'Sarah J.',
    hostAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop',
    imageUrl:
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1200&auto=format&fit=crop',
    category: 'Yoga',
    status: 'UPCOMING',
    statusLabel: 'Tomorrow',
    time: '8:00 AM - 9:30 AM',
    location: 'Zenith Studio, Downtown',
    action: 'upcoming',
  },
  {
    id: 'pottery-workshop',
    title: "Beginner's Pottery Workshop",
    hostName: 'Mark T.',
    hostAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
    imageUrl:
      'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=1200&auto=format&fit=crop',
    category: 'Crafts',
    status: 'IN_PROGRESS',
    statusLabel: 'In Progress',
    time: '2:00 PM - 5:00 PM (Ends in 1hr)',
    location: 'The Clay House, Westside',
    action: 'in-progress',
  },
  {
    id: 'italian-pasta',
    title: 'Italian Pasta Masterclass',
    hostName: 'Chef Elena',
    hostAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=120&auto=format&fit=crop',
    imageUrl:
      'https://images.unsplash.com/photo-1516211697506-8360dbcfe9a4?q=80&w=1200&auto=format&fit=crop',
    category: 'Culinary',
    status: 'COMPLETED',
    statusLabel: 'Oct 12',
    rating: 5,
    action: 'completed',
  },
]

const tabs = [
  { label: 'All Activities', value: 'ALL' },
  { label: 'Upcoming', value: 'UPCOMING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
]

const normalizeStatus = (value) => {
  const status = String(value ?? '').toUpperCase()

  if (status.includes('PROGRESS')) return 'IN_PROGRESS'
  if (status.includes('COMPLETE') || status.includes('DONE')) return 'COMPLETED'
  if (status.includes('UPCOMING') || status.includes('PENDING')) return 'UPCOMING'

  return 'UPCOMING'
}

const pickActivity = (item) => item?.activity ?? item

const formatTimeRange = (activity, fallback) => {
  if (activity?.time) return activity.time

  const startValue = activity?.startTime ?? activity?.startDate
  const endValue = activity?.endTime ?? activity?.endDate

  if (!startValue) return fallback.time

  const start = new Date(startValue)
  const end = endValue ? new Date(endValue) : null

  if (Number.isNaN(start.getTime())) return fallback.time

  const startText = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (!end || Number.isNaN(end.getTime())) return startText

  const endText = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${startText} - ${endText}`
}

const mapJoinedActivity = (item, index) => {
  const activity = pickActivity(item)
  const fallback = fallbackActivities[index % fallbackActivities.length]
  const status = normalizeStatus(item?.status ?? activity?.status ?? fallback.status)

  return {
    id: activity?.id ?? activity?.activityId ?? item?.id ?? fallback.id,
    title: activity?.title ?? activity?.name ?? fallback.title,
    hostName:
      activity?.hostName ??
      activity?.hostBuddyName ??
      activity?.host?.name ??
      fallback.hostName,
    hostAvatar: activity?.hostAvatar ?? activity?.host?.avatarUrl ?? fallback.hostAvatar,
    imageUrl:
      activity?.thumbnailUrl ??
      activity?.imageUrl ??
      activity?.coverUrl ??
      fallback.imageUrl,
    category: activity?.category ?? activity?.activityType ?? fallback.category,
    status,
    statusLabel: activity?.statusLabel ?? item?.statusLabel ?? fallback.statusLabel,
    time: formatTimeRange(activity, fallback),
    location:
      activity?.locationName ??
      activity?.address ??
      activity?.location ??
      fallback.location,
    rating: item?.rating ?? activity?.rating ?? fallback.rating,
    action: fallback.action,
  }
}

const safeList = (value) => (Array.isArray(value) ? value : [])

const getResponseList = (response) =>
  safeList(
    response?.data?.data ??
      response?.data?.content ??
      response?.data ??
      response,
  )

const StatusBadge = ({ activity }) => {
  const isInProgress = activity.status === 'IN_PROGRESS'
  const isCompleted = activity.status === 'COMPLETED'

  return (
    <span
      className={`absolute left-4 top-4 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold shadow-sm ${
        isInProgress
          ? 'bg-orange-500 text-white'
          : isCompleted
            ? 'bg-white/85 text-slate-600'
            : 'bg-white text-blue-600'
      }`}
    >
      {isInProgress ? (
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      ) : (
        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )}
      {activity.statusLabel}
    </span>
  )
}

const ActivityCard = ({ activity }) => {
  const isCompleted = activity.status === 'COMPLETED'
  const isInProgress = activity.status === 'IN_PROGRESS'

  return (
    <article
      className={`overflow-hidden rounded-lg bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)] ${
        isInProgress ? 'border border-orange-200' : 'border border-transparent'
      }`}
    >
      <div className="relative h-[150px] overflow-hidden">
        <img
          src={activity.imageUrl}
          alt={activity.title}
          className={`h-full w-full object-cover ${isCompleted ? 'opacity-70 saturate-[0.75]' : ''}`}
        />
        <StatusBadge activity={activity} />
      </div>

      <div className="flex min-h-[256px] flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <h2
            className={`max-w-[170px] text-[21px] font-bold leading-[1.12] ${
              isCompleted ? 'text-slate-500' : 'text-slate-950'
            }`}
          >
            {activity.title}
          </h2>
          <span className="rounded bg-teal-100 px-2 py-1 text-[11px] font-medium text-teal-700">
            {activity.category}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-600">
          <img
            src={activity.hostAvatar}
            alt=""
            className="h-5 w-5 rounded-full object-cover"
          />
          <span>Hosted by {activity.hostName}</span>
        </div>

        {isCompleted ? (
          <div className="mt-auto">
            <div className="mb-5 flex items-center gap-2 text-sm text-slate-500">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.48 3.5l2.23 4.52 4.99.72-3.61 3.52.85 4.97-4.46-2.35-4.46 2.35.85-4.97-3.61-3.52 4.99-.72 2.23-4.52z" />
              </svg>
              You rated {activity.rating ?? 5} stars
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm" type="button">
                Leave Review
              </button>
              <button className="rounded-md border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-600 shadow-sm" type="button">
                Book Again
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <div className="space-y-2 text-sm text-slate-700">
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                </svg>
                <span>{activity.time}</span>
              </div>
              <div className="flex items-start gap-2">
                <svg className="mt-0.5 h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10.5a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>{activity.location}</span>
              </div>
            </div>

            {isInProgress ? (
              <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-3 text-xs font-semibold text-white" type="button">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7z" />
                </svg>
                Get Directions
              </button>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button className="rounded-md border border-blue-500 px-4 py-3 text-xs font-semibold text-blue-600" type="button">
                  View Details
                </button>
                <button className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-3 text-xs font-semibold text-white" type="button">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4v8z" />
                  </svg>
                  Chat
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

const MyActivitiesPage = () => {
  useDocumentTitle('My Activities')
  const { isAuthenticated } = useAuth()
  const [activities, setActivities] = useState(fallbackActivities)
  const [activeTab, setActiveTab] = useState('ALL')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      return
    }

    const fetchJoinedActivities = async () => {
      try {
        setLoading(true)
        const response = await activityService.getMyRegistrations()
        const joinedActivities = getResponseList(response)

        if (joinedActivities.length > 0) {
          setActivities(joinedActivities.map(mapJoinedActivity))
        }
      } catch (error) {
        if (error?.response?.status !== 403) {
          console.error('Failed to load joined activities:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchJoinedActivities()
  }, [isAuthenticated])

  const filteredActivities = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return activities.filter((activity) => {
      const matchesTab = activeTab === 'ALL' || activity.status === activeTab
      const matchesSearch =
        !normalizedSearch ||
        activity.title.toLowerCase().includes(normalizedSearch) ||
        activity.category.toLowerCase().includes(normalizedSearch) ||
        activity.location?.toLowerCase().includes(normalizedSearch)

      return matchesTab && matchesSearch
    })
  }, [activeTab, activities, searchTerm])

  return (
    <div className="mx-auto w-full max-w-[820px] rounded-sm bg-[#f7f8ff] px-8 py-7 text-[#0f172a] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[25px] font-bold leading-none text-slate-950">
            My Activities
          </h1>
          <p className="mt-3 text-[13px] text-slate-700">
            Track and manage all your past, present, and future experiences.
          </p>
        </div>

        <label className="relative w-full sm:w-[200px]">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 110-15 7.5 7.5 0 010 15z" />
          </svg>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="h-9 w-full rounded-full border border-slate-300 bg-white pl-9 pr-4 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Search activities..."
            type="search"
          />
        </label>
      </div>

      <div className="mt-8 border-b border-slate-300">
        <div className="flex items-center gap-5 sm:gap-10">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`relative px-4 pb-3 text-xs font-medium transition ${
                activeTab === tab.value ? 'text-blue-600' : 'text-slate-600'
              }`}
            >
              {tab.label}
              {tab.value === 'IN_PROGRESS' && (
                <span className="ml-2 inline-block h-1.5 w-1.5 rounded-full bg-orange-500 align-middle" />
              )}
              {activeTab === tab.value && (
                <span className="absolute bottom-[-1px] left-0 h-0.5 w-full bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
          Loading your activities...
        </div>
      ) : filteredActivities.length > 0 ? (
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {filteredActivities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-dashed border-slate-300 bg-white py-14 text-center text-sm text-slate-500">
          No activities found.
        </div>
      )}
    </div>
  )
}

export default MyActivitiesPage
