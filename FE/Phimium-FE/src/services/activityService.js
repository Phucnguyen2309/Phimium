import http from './http'

const activityService = {
  getAllActivities: () => {
    return http.get('/activities')
  },

  getActivityById: (id) => {
    return http.get(`/activities/${id}`)
  }
}

export default activityService
