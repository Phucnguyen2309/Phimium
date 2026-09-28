import { t } from '@/utils/i18n.js'

export function formatRating(value) {
  const rating = Number(value)

  if (!Number.isFinite(rating) || rating <= 0) {
    return t('activityDetail.noRating')
  }

  return t('activityDetail.rating', { rating: rating.toFixed(1) })
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
