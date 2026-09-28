import { ACTIVITY_STATUS } from '@/constants/activity.js'
import { formatEnumLabel, formatMoney } from '@/utils/format.js'
import { t } from '@/utils/i18n.js'
import { getResponseList } from '@/utils/response.js'

export { formatDateTime } from '@/utils/format.js'
export { getValidImage } from '@/utils/image.js'

export const formatActivityType = (type) =>
  formatEnumLabel(type, t('activity.defaultType'))

/** Label trạng thái theo ngôn ngữ hiện tại (locales: activityStatus.*) */
export const formatStatus = (status) => {
  if (!status) return t(`activityStatus.${ACTIVITY_STATUS.PUBLISHED}`)

  const key = String(status).toUpperCase()

  return ACTIVITY_STATUS[key]
    ? t(`activityStatus.${key}`)
    : formatEnumLabel(status)
}

export const formatPrice = formatMoney

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
  title: activity?.title ?? t('activity.untitled'),
  description: activity?.description ?? '',
  activityType: activity?.activityType ?? 'ACTIVITY',
  status: activity?.status ?? null,
  thumbnailUrl: activity?.thumbnailUrl ?? '',
  startTime: activity?.startTime ?? null,
  endTime: activity?.endTime ?? null,
  registrationDeadline: activity?.registrationDeadline ?? null,
  locationName: activity?.locationName ?? '',
  address: activity?.address ?? '',
  participationFee: activity?.participationFee ?? 0,
  minimumParticipants: activity?.minimumParticipants ?? 0,
  maximumParticipants: activity?.maximumParticipants ?? 0,
  currentParticipants: activity?.currentParticipants ?? null,
  groupMinSize: activity?.groupMinSize ?? 0,
  groupMaxSize: activity?.groupMaxSize ?? 0,
  longitude: activity?.longitude ?? null,
  latitude: activity?.latitude ?? null,
  hostBuddyId: activity?.hostBuddyId ?? null,
  hostBuddyName: activity?.hostBuddyName ?? t('activity.unknownBuddy'),
  createdById: activity?.createdById ?? null,
  createdAt: activity?.createdAt ?? null,
  updatedAt: activity?.updatedAt ?? null,
})

export const mapActivitiesResponse = (response) =>
  getResponseList(response).map(mapActivity)
