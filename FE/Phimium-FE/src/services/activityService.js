import http from './http'

const activityService = {
  getAllActivities: () => {
    return http.get('/activity/getAll')
  }
}

export default activityService
