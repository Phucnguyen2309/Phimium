import http from '@/services/http.js'

const activityService = {
  getAllActivities: () => http.get('/activity/getAll'),

  getActivityById: (id) => http.get(`/activities/${id}`),

  joinActivity: (payload) => http.post('/v1/registrations/join', payload),

  getMyRegistrations: () => http.get('/activity/joined'),

  getMyGroups: () => http.get('/v1/registrations/my-groups'),

  getGuidelineByActivityId: (activityId) =>
    http.get(`/v1/activities/${activityId}/guidelines`),
}

export default activityService
