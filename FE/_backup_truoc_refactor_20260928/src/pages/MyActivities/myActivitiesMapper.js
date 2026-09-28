import {
  DEFAULT_ACTIVITY,
  ACTIVITY_STATUS_UI,
  ACTIVITY_STATUS_LABELS,
} from './constants.js'

const normalizeStatus = (value) => {
  const status = String(value ?? '').toUpperCase()

  return ACTIVITY_STATUS_UI[status] ?? DEFAULT_ACTIVITY.status
}

const getStatusLabel = (value) => {
  const status = String(value ?? '').toUpperCase()

  return ACTIVITY_STATUS_LABELS[status] ?? DEFAULT_ACTIVITY.statusLabel
}

const formatTimeRange = (activity, fallback = DEFAULT_ACTIVITY) => {
  const startValue = activity?.startTime
  const endValue = activity?.endTime

  if (!startValue) return fallback.time

  const start = new Date(startValue)
  const end = endValue ? new Date(endValue) : null

  if (Number.isNaN(start.getTime())) return fallback.time

  const dateText = start.toLocaleDateString('vi-VN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const startText = start.toLocaleTimeString('vi-VN', {
    hour: 'numeric',
    minute: '2-digit',
  })

  if (!end || Number.isNaN(end.getTime())) {
    return `${dateText}, ${startText}`
  }

  const endText = end.toLocaleTimeString('vi-VN', {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${dateText}, ${startText} - ${endText}`
}

export const safeList = (value) => (Array.isArray(value) ? value : [])

export const getResponseList = (response) => {
  return safeList(
    response?.data?.data ??
      response?.data?.content ??
      response?.data ??
      response,
  )
}

export const mapActivity = (activity) => {
  const rawStatus = activity?.status
  const status = normalizeStatus(rawStatus)

  return {
    id: activity?.id ?? DEFAULT_ACTIVITY.id,

    title: activity?.title ?? DEFAULT_ACTIVITY.title,
    description: activity?.description ?? DEFAULT_ACTIVITY.description,

    hostName: activity?.hostBuddyName ?? DEFAULT_ACTIVITY.hostName,
    hostBuddyId: activity?.hostBuddyId ?? null,
    createdById: activity?.createdById ?? null,

    hostAvatar: activity?.avatarUrl,
    imageUrl: activity?.thumbnailUrl || DEFAULT_ACTIVITY.imageUrl,

    category: activity?.activityType ?? DEFAULT_ACTIVITY.category,

    status,
    statusLabel: getStatusLabel(rawStatus),

    time: formatTimeRange(activity, DEFAULT_ACTIVITY),

    location:
      activity?.locationName ??
      activity?.address ??
      DEFAULT_ACTIVITY.location,

    locationName: activity?.locationName ?? '',
    address: activity?.address ?? '',

    participationFee:
      activity?.participationFee ?? DEFAULT_ACTIVITY.participationFee,

    minimumParticipants:
      activity?.minimumParticipants ?? DEFAULT_ACTIVITY.minimumParticipants,

    maximumParticipants:
      activity?.maximumParticipants ?? DEFAULT_ACTIVITY.maximumParticipants,

    groupMinSize: activity?.groupMinSize ?? DEFAULT_ACTIVITY.groupMinSize,
    groupMaxSize: activity?.groupMaxSize ?? DEFAULT_ACTIVITY.groupMaxSize,

    longitude: activity?.longitude ?? DEFAULT_ACTIVITY.longitude,
    latitude: activity?.latitude ?? DEFAULT_ACTIVITY.latitude,

    startTime: activity?.startTime ?? null,
    endTime: activity?.endTime ?? null,
    registrationDeadline: activity?.registrationDeadline ?? null,

    createdAt: activity?.createdAt ?? null,
    updatedAt: activity?.updatedAt ?? null,

    rating: DEFAULT_ACTIVITY.rating,
    action: DEFAULT_ACTIVITY.action,
  }
}

export const mapActivitiesResponse = (response) => {
  return getResponseList(response).map(mapActivity)
}