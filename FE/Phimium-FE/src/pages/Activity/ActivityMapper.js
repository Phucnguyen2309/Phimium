export const safeList = (value) => (Array.isArray(value) ? value : [])

export const getResponseList = (response) =>
  safeList(
    response?.data?.data ??
      response?.data?.content ??
      response?.data ??
      response,
  )

export const getValidImage = (url) => {
  if (!url || url === 'string') return null
  return url
}

export const formatActivityType = (type) => {
  if (!type) return 'Activity'

  return String(type)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const formatStatus = (status) => {
  if (!status) return 'Published'

  return String(status)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const formatPrice = (price) => {
  const value = Number(price ?? 0)

  if (value <= 0) return 'Free'

  return `${value.toLocaleString('vi-VN')} VND`
}

export const formatDateTime = (value) => {
  if (!value) return 'TBA'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'TBA'

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const getRemainingSlots = (activity) => {
  const maximumParticipants = Number(activity?.maximumParticipants ?? 0)

  const currentParticipants = Number(
    activity?.currentParticipants ??
      activity?.joinedParticipants ??
      activity?.participantCount ??
      activity?.registeredCount ??
      0,
  )

  return Math.max(maximumParticipants - currentParticipants, 0)
}

export const mapActivity = (activity) => ({
  id: activity?.id ?? '',
  title: activity?.title ?? 'Untitled Activity',
  description: activity?.description ?? '',
  activityType: activity?.activityType ?? 'ACTIVITY',
  thumbnailUrl: activity?.thumbnailUrl ?? '',
  startTime: activity?.startTime ?? null,
  endTime: activity?.endTime ?? null,
  registrationDeadline: activity?.registrationDeadline ?? null,
  locationName: activity?.locationName ?? '',
  address: activity?.address ?? '',
  participationFee: activity?.participationFee ?? 0,
  minimumParticipants: activity?.minimumParticipants ?? 0,
  maximumParticipants: activity?.maximumParticipants ?? 0,
  groupMinSize: activity?.groupMinSize ?? 0,
  groupMaxSize: activity?.groupMaxSize ?? 0,
  longitude: activity?.longitude ?? null,
  latitude: activity?.latitude ?? null,
  hostBuddyId: activity?.hostBuddyId ?? null,
  hostBuddyName: activity?.hostBuddyName ?? 'Unknown host',
  createdById: activity?.createdById ?? null,
  createdAt: activity?.createdAt ?? null,
  updatedAt: activity?.updatedAt ?? null,
})

export const mapActivitiesResponse = (response) => {
  return getResponseList(response).map(mapActivity)
}