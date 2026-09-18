import http from '@/services/http.js'

const feedbackService = {
  createFeedback: (registrationId, payload) => http.post(`/feedback/registrations/${registrationId}`, payload),

  getMyFeedbacks: () => http.get('/feedback/me'),

  getFeedbacksByBuddy: (buddyId) => http.get(`/feedback/buddies/${buddyId}`),
}

export default feedbackService
