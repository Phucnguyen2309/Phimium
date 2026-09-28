import { t } from '@/utils/i18n.js'
import { getValidImage } from '@/utils/image.js'
import { getResponseList, safeList } from '@/utils/response.js'

export const mapParticipant = (participant) => ({
  userId: participant?.userId ?? '',
  fullName: participant?.fullName ?? t('common.unknownUser'),
  avatarUrl: getValidImage(participant?.avatarUrl),
})

export const mapMyGroup = (group) => ({
  id: group?.groupId ?? '',
  groupId: group?.groupId ?? '',
  groupName: group?.groupName ?? t('group.untitled'),
  status: group?.status ?? 'UNKNOWN',
  thumbnailUrl: getValidImage(group?.thumbnailUrl),
  maximumParticipants: group?.maximumParticipants ?? 0,
  currentParticipants:
    group?.currentParticipants ?? safeList(group?.participants).length,

  activityId: group?.activityId ?? '',
  hostId: group?.hostId ?? '',
  hostName: group?.hostName,
  hostAvatar: getValidImage(group?.avatarUrl),

  createdAt: group?.createdAt ?? '',

  participants: safeList(group?.participants).map(mapParticipant),
})

export const mapMyGroupsResponse = (response) =>
  getResponseList(response).map(mapMyGroup)
