import http from '@/services/http.js'

const feedbackService = {
  /** Các đánh giá tôi đã viết (FeedBackResponse[]) */
  getMyFeedbacks: () => http.get('/feedback/me'),

  /**
   * Đánh giá một chuyến đi.
   * payload: { tourRating, tourComment, buddyRating, buddyComment } (rating 1–5, comment ≤ 1000 ký tự)
   */
  createFeedback: (registrationId, payload) =>
    http.post(`/feedback/registrations/${registrationId}`, payload),
}

export default feedbackService
