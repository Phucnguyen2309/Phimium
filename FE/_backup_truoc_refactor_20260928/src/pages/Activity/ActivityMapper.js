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
  if (!type) return 'Hoạt động'

  return String(type)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const formatStatus = (status) => {
  if (!status) return 'Đã đăng'

  const labels = {
    PUBLISHED: 'Đã đăng',
    UPCOMING: 'Sắp diễn ra',
    ONGOING: 'Đang diễn ra',
    COMPLETED: 'Đã hoàn thành',
    CANCELLED: 'Đã hủy',
  }

  const key = String(status).toUpperCase()
  if (labels[key]) return labels[key]

  return String(status)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export const formatPrice = (price) => {
  const value = Number(price ?? 0)

  if (value <= 0) return 'Miễn phí'

  return `${value.toLocaleString('vi-VN')} VND`
}

export const formatDateTime = (value) => {
  if (!value) return 'Sắp cập nhật'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Sắp cập nhật'

  return date.toLocaleString('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
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
  title: activity?.title ?? 'Hoạt động chưa đặt tên',
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
  hostBuddyName: activity?.hostBuddyName ?? 'Buddy chưa xác định',
  createdById: activity?.createdById ?? null,
  createdAt: activity?.createdAt ?? null,
  updatedAt: activity?.updatedAt ?? null,
})

export const mapActivitiesResponse = (response) => {
  return getResponseList(response).map(mapActivity)
}
