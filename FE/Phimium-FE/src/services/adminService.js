import http from '@/services/http.js'

const adminService = {
  // 1. Dashboard
  getDashboardSummary: () => http.get('/v1/admin/dashboard/summary'),

  // 2. Activities & Departures
  createActivity: (formData) =>
    http.post('/v1/admin/activities', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // Backend nhận multipart: part "request" (JSON), "image" (thumbnail mới), "images" (ảnh gallery theo vị trí)
  updateActivity: (activityId, formData) =>
    http.put(`/v1/admin/activities/${activityId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  deleteActivity: (activityId) =>
    http.delete(`/v1/admin/activities/${activityId}`),

  getDepartures: (params) => http.get('/v1/admin/departures', { params }),

  getDepartureById: (id) => http.get(`/v1/admin/departures/${id}`),

  createDepartures: (activityId, payload) =>
    http.post(`/v1/admin/activities/${activityId}/departures`, payload),

  updateDepartureCapacity: (id, payload) =>
    http.patch(`/v1/admin/departures/${id}/capacity`, payload),

  // 3. Bookings & Registrations
  getRegistrations: (params) => http.get('/v1/admin/registrations', { params }),

  getRegistrationById: (id) => http.get(`/v1/admin/registrations/${id}`),

  confirmPayment: (registrationId) =>
    http.post(`/v1/admin/registrations/${registrationId}/confirm-payment`),

  getBuddyCandidates: (registrationId) =>
    http.get(`/v1/admin/registrations/${registrationId}/buddy-candidates`),

  assignBuddy: (registrationId, payload) =>
    http.post(`/v1/admin/registrations/${registrationId}/assign-buddy`, payload),

  // 4. Buddies
  getBuddies: (params) => http.get('/v1/admin/buddies', { params }),

  updateBuddyStatus: (buddyId, status) =>
    http.patch(`/v1/admin/buddies/${buddyId}/status`, null, { params: { status } }),

  // 5. Users
  getUsers: (params) => http.get('/v1/admin/users', { params }),

  getUserById: (userId) => http.get(`/v1/admin/users/${userId}`),

  updateUserStatus: (userId, status) =>
    http.patch(`/v1/admin/users/${userId}/status`, null, { params: { status } }),

  // 6. Coupons
  getCoupons: () => http.get('/v1/admin/coupons'),

  createCoupon: (payload) => http.post('/v1/admin/coupons', payload),

  updateCoupon: (couponId, payload) =>
    http.put(`/v1/admin/coupons/${couponId}`, payload),

  toggleCouponStatus: (couponId) =>
    http.patch(`/v1/admin/coupons/${couponId}/toggle`),

  // 7. Payments
  getPayments: (params) => http.get('/v1/admin/payments', { params }),

  getPaymentById: (paymentId) => http.get(`/v1/admin/payments/${paymentId}`),

  // 8. Feedbacks
  getFeedbacks: (params) => http.get('/v1/admin/feedbacks', { params }),

  getFeedbackById: (feedbackId) => http.get(`/v1/admin/feedbacks/${feedbackId}`),

  deleteFeedback: (feedbackId) => http.delete(`/v1/admin/feedbacks/${feedbackId}`),
}

export default adminService