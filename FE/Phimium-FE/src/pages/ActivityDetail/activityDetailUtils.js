import { t } from '@/utils/i18n.js'

export function formatRating(value) {
  const rating = Number(value)

  if (!Number.isFinite(rating) || rating <= 0) {
    return t('activityDetail.noRating')
  }

  return t('activityDetail.rating', { rating: rating.toFixed(1) })
}
