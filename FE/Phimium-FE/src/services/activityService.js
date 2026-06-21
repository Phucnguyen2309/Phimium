import http from '@/services/http.js'

const activityService = {
  getAllActivities: () => http.get('/activity/getAll'),

  getActivityById: (activityId) => http.get(`/activity/${activityId}`),

  joinActivity: (payload) => http.post('/v1/registrations/join', payload),

  getMyRegistrations: () => http.get('/activity/joined'),

  getMyActivities : () => http.get(`/activity/joined`) ,

  getMyGroups: () => http.get('/v1/registrations/my-groups'),

  getGroupdetails : (groupId) => http.get(`/v1/registrations/groups/${groupId}`),

  getGuidelineByActivityId: (activityId) =>
    http.get(`/v1/activities/${activityId}/guidelines`),
}

export default activityService
