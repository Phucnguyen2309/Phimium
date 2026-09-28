import { ACTIVITY_STATUS } from '@/constants/activity.js'
import { formatStatus } from '@/features/activity/activityMapper.js'
import { formatTimeRange } from '@/utils/format.js'
import { getValidImage } from '@/utils/image.js'
import { getResponseList } from '@/utils/response.js'

import { getDefaultActivity } from './constants.js'

const normalizeStatus = (value, fallback) => {
  const status = String(value ?? '').toUpperCase()

  return ACTIVITY_STATUS[status] ?? fallback
}

export const mapMyActivity = (activity) => {
  const defaults = getDefaultActivity()
  const status = normalizeStatus(activity?.status, defaults.status)

  return {
    id: activity?.id ?? defaults.id,

    title: activity?.title ?? defaults.title,
    description: activity?.description ?? defaults.description,

    hostName: activity?.hostBuddyName ?? defaults.hostName,
    hostBuddyId: activity?.hostBuddyId ?? null,
    createdById: activity?.createdById ?? null,

    hostAvatar: getValidImage(activity?.avatarUrl),
    imageUrl: getValidImage(activity?.thumbnailUrl) || defaults.imageUrl,

    category: activity?.activityType ?? defaults.category,

    status,
    statusLabel: formatStatus(status),

    time: formatTimeRange(activity?.startTime, activity?.endTime, {
      fallback: defaults.time,
    }),

    location:
      activity?.locationName ?? activity?.address ?? defaults.location,
    locationName: activity?.locationName ?? '',
    address: activity?.address ?? '',

    participationFee:
      activity?.participationFee ?? defaults.participationFee,
    minimumParticipants:
      activity?.minimumParticipants ?? defaults.minimumParticipants,
    maximumParticipants:
      activity?.maximumParticipants ?? defaults.maximumParticipants,
    groupMinSize: activity?.groupMinSize ?? defaults.groupMinSize,
    groupMaxSize: activity?.groupMaxSize ?? defaults.groupMaxSize,

    longitude: activity?.longitude ?? defaults.longitude,
    latitude: activity?.latitude ?? defaults.latitude,

    startTime: activity?.startTime ?? null,
    endTime: activity?.endTime ?? null,
    registrationDeadline: activity?.registrationDeadline ?? null,

    createdAt: activity?.createdAt ?? null,
    updatedAt: activity?.updatedAt ?? null,
  }
}

export const mapMyActivitiesResponse = (response) =>
  getResponseList(response).map(mapMyActivity)
