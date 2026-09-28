import http from '@/services/http.js'

const groupService = {
  getMyGroups: () => http.get('/v1/registrations/my-groups'),

  getGroupDetail: (groupId) => http.get(`/v1/registrations/groups/${groupId}`),
}

export default groupService
