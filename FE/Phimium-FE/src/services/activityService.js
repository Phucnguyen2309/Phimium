import http from '@/services/http.js'

const activityService = {
  getAllActivities: () => http.get('/activity/getAll'),

  getActivityById: (activityId) => http.get(`/activity/${activityId}`),

  getMyActivities: () => http.get('/activity/joined'),

  joinActivity: (payload) => http.post('/v1/registrations/join', payload),

  getGuidelineByActivityId: (activityId) =>
    http.get(`/v1/activities/${activityId}/guidelines`),
}

export default activityService
