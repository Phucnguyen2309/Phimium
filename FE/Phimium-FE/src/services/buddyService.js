import http from '@/services/http.js'

const buddyService = {
  getHostedActivities: (buddyId) =>
    http.get('/buddies/getActivityByBuddy', { params: { buddy: buddyId } }),

  upgradeToBuddy: (payload) => http.patch('/buddies/upgrade', payload),

  getFeedbackByBuddy: (buddyId) => http.get(`/feedback/buddies/${buddyId}`),
}

export default buddyService
