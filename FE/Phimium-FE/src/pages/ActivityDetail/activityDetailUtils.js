export function getValidImage(value) {
  if (!value || value === 'string') return ''
  return value
}

export function getInitials(name) {
  const cleanName = String(name ?? '').trim()

  if (!cleanName || cleanName === 'string') return 'P'

  const words = cleanName.split(/\s+/)

  if (words.length >= 2) {
    return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
  }

  return cleanName.charAt(0).toUpperCase()
}

export function formatRating(value) {
  const rating = Number(value)

  if (!Number.isFinite(rating) || rating <= 0) {
    return 'Chưa có đánh giá'
  }

  return `${rating.toFixed(1)} rating`
}

export function hasValidCoordinates(activity) {
  const latitude = Number(activity?.latitude)
  const longitude = Number(activity?.longitude)

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude !== 0 &&
    longitude !== 0
  )
}