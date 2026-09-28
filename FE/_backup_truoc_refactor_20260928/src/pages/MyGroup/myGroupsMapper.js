export const safeList = (value) => (Array.isArray(value) ? value : [])

export const getResponseList = (response) =>
  safeList(
    response?.data?.data ??
      response?.data ??
      response,
  )

export const mapParticipant = (participant) => ({
  userId: participant?.userId ?? '',
  fullName: participant?.fullName ?? 'Unknown user',
  avatarUrl:
    participant?.avatarUrl && participant.avatarUrl !== 'string'
      ? participant.avatarUrl
      : '',
})

export const mapMyGroup = (group) => ({
  id: group?.groupId ?? '',
  groupId: group?.groupId ?? '',
  groupName: group?.groupName ?? 'Nhóm chưa có tên',
  status: group?.status ?? 'UNKNOWN',
  thumbnailUrl: group?.thumbnailUrl,
  maximumParticipants: group?.maximumParticipants ?? 0,
  currentParticipants:
    group?.currentParticipants ?? safeList(group?.participants).length,

  activityId: group?.activityId ?? '',
  hostId: group?.hostId ?? '',
  hostName:group?.hostName,
  hostAvatar:group?.avatarUrl,

  createdAt: group?.createdAt ?? '',

  participants: safeList(group?.participants).map(mapParticipant),
})

export const mapMyGroupsResponse = (response) =>
  getResponseList(response).map(mapMyGroup)