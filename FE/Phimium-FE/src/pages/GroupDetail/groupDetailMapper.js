import { t } from '@/utils/i18n.js'
import { getValidImage } from '@/utils/image.js'
import { getResponseData, safeList } from '@/utils/response.js'

const getHostFromParticipants = (group) => {
  const participants = safeList(group?.participants)

  return (
    participants.find((participant) => participant.userId === group?.hostId) ??
    participants[0] ??
    null
  )
}

export const mapParticipant = (participant) => ({
  userId: participant?.userId ?? '',
  fullName: participant?.fullName ?? t('common.unknownUser'),
  avatarUrl: getValidImage(participant?.avatarUrl),
})

export const mapGroupDetail = (response) => {
  const group = getResponseData(response) ?? {}
  const activity = group?.activity ?? {}
  const hostParticipant = getHostFromParticipants(group)

  const participants = safeList(group?.participants).map(mapParticipant)

  return {
    groupId: group?.groupId ?? group?.id ?? '',
    groupName: group?.groupName ?? t('group.untitled'),
    status: group?.status ?? 'UNKNOWN',

    activityId: group?.activityId ?? activity?.id ?? '',
    activityTitle:
      group?.activityTitle ??
      activity?.title ??
      group?.groupName ??
      t('groupDetail.pageTitle'),

    activityType:
      group?.activityType ??
      activity?.activityType ??
      'ACTIVITY',

    thumbnailUrl: getValidImage(
      group?.thumbnailUrl ?? activity?.thumbnailUrl,
    ),

    startTime: group?.startTime ?? activity?.startTime ?? '',
    endTime: group?.endTime ?? activity?.endTime ?? '',

    locationName:
      group?.locationName ??
      activity?.locationName ??
      '',

    address:
      group?.address ??
      activity?.address ??
      '',

    hostId: group?.hostId ?? '',
    hostName:
      group?.hostName ??
      hostParticipant?.fullName ??
      t('activity.unknownBuddy'),

    hostAvatar:
      getValidImage(group?.hostAvatar) ||
      getValidImage(group?.avatarUrl) ||
      getValidImage(hostParticipant?.avatarUrl),

    maximumParticipants: group?.maximumParticipants ?? 0,
    currentParticipants:
      group?.currentParticipants ?? participants.length,

    createdAt: group?.createdAt ?? '',

    participants,
  }
}