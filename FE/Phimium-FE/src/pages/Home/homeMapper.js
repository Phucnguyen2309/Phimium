export const fallbackActivities = []

export const safeList = (value) => (Array.isArray(value) ? value : [])

export const getResponseList = (response) =>
  safeList(
    response?.data?.data ??
      response?.data?.content ??
      response?.data ??
      response,
  )

export const formatTime = (value) => {
  if (!value) return 'Sắp cập nhật'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Sắp cập nhật'

  return date.toLocaleString('vi-VN', {
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

  const remaining = maximumParticipants - currentParticipants

  return Math.max(remaining, 0)
}