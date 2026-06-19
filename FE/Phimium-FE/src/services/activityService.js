import http from './http'

const activityService = {
  getAllActivities: () => {
    return http.get('/activities')
  },

  getActivityById: (id) => {
    return http.get(`/activities/${id}`)
  },

  joinActivity: (payload) => {
    return http.post('/v1/registrations/join', payload)
  },

  getMyRegistrations: () => {
    return http.get('/v1/registrations/me')
  },

  getMyGroups: () => {
    return http.get('/v1/registrations/my-groups')
  },

  getGuidelineByActivityId: (activityId) => {
    return http.get(`/v1/activities/${activityId}/guidelines`)
  }
}

export default activityService
