import http from '@/services/http.js'

const buddyService = {
  // Sửa từ '/api/buddies/...' thành '/buddies/...'
  getHostedActivities: (buddyId) => http.get(`/buddies/getActivityByBuddy?buddy=${buddyId}`),

  upgradeToBuddy: (payload) => http.patch('/buddies/upgrade', payload),
  
  // Sửa từ '/api/feedback/...' thành '/feedback/...'
  getFeedbackByBuddy: (buddyId) => http.get(`/feedback/buddies/${buddyId}`),
}

export default buddyService